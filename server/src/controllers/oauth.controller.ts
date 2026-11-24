import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { ApiError } from "../middlewares/errorHandler";
import { asyncHandler } from "../utils/asyncHandler";
import { comparePassword, signToken } from "../utils/auth";
import { AuthRequest } from "../middlewares/auth";
import {
  buildAuthorizationUrl,
  createOAuthState,
  createPendingLink,
  exchangeCodeForProfile,
  getClientUrl,
  isOAuthProvider,
  sanitizeRedirect,
  verifyOAuthState,
  verifyPendingLink,
} from "../utils/oauth";

function toSafeUser(user: {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified: Date | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function clientRedirect(res: Response, params: Record<string, string>) {
  const url = new URL("/auth/callback", getClientUrl());
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  res.redirect(url.toString());
}

export const oauthStart = asyncHandler(async (req: Request, res: Response) => {
  const providerParam = String(req.params.provider || "");
  if (!isOAuthProvider(providerParam)) {
    throw new ApiError(400, "Proveedor OAuth no soportado");
  }

  const redirectTo = sanitizeRedirect(
    typeof req.query.redirect === "string" ? req.query.redirect : "/"
  );

  try {
    const { stateToken, codeVerifier } = createOAuthState(providerParam, redirectTo);
    const url = buildAuthorizationUrl(providerParam, stateToken, codeVerifier);
    res.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar OAuth";
    const url = new URL("/auth/callback", getClientUrl());
    url.searchParams.set("error", message);
    res.redirect(url.toString());
  }
});

export const oauthCallback = asyncHandler(async (req: Request, res: Response) => {
  const providerParam = String(req.params.provider || "");
  if (!isOAuthProvider(providerParam)) {
    return clientRedirect(res, { error: "Proveedor OAuth no soportado" });
  }

  if (typeof req.query.error === "string" && req.query.error) {
    const message =
      typeof req.query.error_description === "string" && req.query.error_description
        ? req.query.error_description
        : "No se pudo completar el inicio de sesión con el proveedor";
    return clientRedirect(res, { error: message });
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  const stateToken = typeof req.query.state === "string" ? req.query.state : "";
  if (!code || !stateToken) {
    return clientRedirect(res, { error: "Respuesta OAuth inválida" });
  }

  let state;
  try {
    state = verifyOAuthState(stateToken);
  } catch {
    return clientRedirect(res, { error: "La sesión OAuth expiró o es inválida. Intenta de nuevo." });
  }

  if (state.provider !== providerParam) {
    return clientRedirect(res, { error: "Proveedor OAuth inválido" });
  }

  let profile;
  try {
    profile = await exchangeCodeForProfile(providerParam, code, state.codeVerifier);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo verificar la cuenta";
    return clientRedirect(res, { error: message });
  }

  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingAccount) {
    const user = existingAccount.user;
    // Mantener datos frescos del proveedor si faltan
    const data: any = {};
    if (!user.emailVerified && profile.emailVerified) data.emailVerified = new Date();
    if (!user.avatarUrl && profile.avatarUrl) data.avatarUrl = profile.avatarUrl;
    const updated = Object.keys(data).length
      ? await prisma.user.update({ where: { id: user.id }, data })
      : user;

    const token = signToken({ id: updated.id, email: updated.email, role: updated.role });
    return clientRedirect(res, { token, redirect: state.redirectTo || "/" });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existingUser) {
    const pendingToken = createPendingLink(profile, state.redirectTo);
    return clientRedirect(res, {
      link: pendingToken,
      email: profile.email,
      provider: profile.provider,
    });
  }

  const user = await prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      emailVerified: profile.emailVerified ? new Date() : null,
      avatarUrl: profile.avatarUrl ?? null,
      role: "user",
      accounts: {
        create: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
    },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return clientRedirect(res, { token, redirect: state.redirectTo || "/" });
});

export const oauthLinkConfirm = asyncHandler(async (req: Request, res: Response) => {
  const { pendingToken, password } = req.body as { pendingToken?: string; password?: string };
  if (!pendingToken) {
    throw new ApiError(400, "Falta el token de vinculación");
  }

  let pending;
  try {
    pending = verifyPendingLink(pendingToken);
  } catch {
    throw new ApiError(400, "El enlace de vinculación expiró o es inválido. Intenta de nuevo.");
  }

  const user = await prisma.user.findUnique({ where: { email: pending.email } });
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  // Si la cuenta tiene contraseña, pedir confirmación con password.
  // Si no tiene contraseña (cuenta OAuth), permitir si el usuario autenticado es el mismo.
  if (user.passwordHash) {
    if (!password) {
      throw new ApiError(400, "Debes confirmar tu contraseña para vincular la cuenta");
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Contraseña incorrecta");
    }
  } else {
    const authReq = req as AuthRequest;
    const header = authReq.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(
        401,
        "Esta cuenta no tiene contraseña. Inicia sesión con tu proveedor original y vuelve a intentar."
      );
    }
    try {
      const { verifyToken } = await import("../utils/auth");
      const payload = verifyToken(header.slice("Bearer ".length).trim());
      if (payload.id !== user.id) {
        throw new ApiError(403, "No tienes permiso para vincular esta cuenta");
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, "Sesión inválida. Inicia sesión y vuelve a intentar.");
    }
  }

  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: pending.provider,
        providerAccountId: pending.providerAccountId,
      },
    },
  });
  if (existingAccount) {
    if (existingAccount.userId !== user.id) {
      throw new ApiError(409, "Esta cuenta del proveedor ya está vinculada a otro usuario");
    }
  } else {
    await prisma.account.create({
      data: {
        provider: pending.provider,
        providerAccountId: pending.providerAccountId,
        userId: user.id,
      },
    });
  }

  const data: any = {};
  if (!user.emailVerified) data.emailVerified = new Date();
  if (!user.avatarUrl && pending.avatarUrl) data.avatarUrl = pending.avatarUrl;
  const updated = Object.keys(data).length
    ? await prisma.user.update({ where: { id: user.id }, data })
    : user;

  const token = signToken({ id: updated.id, email: updated.email, role: updated.role });
  res.json({ token, user: toSafeUser(updated), redirect: pending.redirectTo || "/" });
});
