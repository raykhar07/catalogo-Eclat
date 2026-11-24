import { Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../middlewares/errorHandler";
import { comparePassword, hashPassword, signToken } from "../utils/auth";
import { AuthRequest } from "../middlewares/auth";

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

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new ApiError(409, "Este correo electrónico ya está registrado");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "user",
    },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user: toSafeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new ApiError(401, "Correo o contraseña incorrectos");
  }

  if (!user.passwordHash) {
    throw new ApiError(
      401,
      "Esta cuenta fue creada con Google o GitHub. Inicia sesión con ese proveedor."
    );
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Correo o contraseña incorrectos");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token, user: toSafeUser(user) });
});

export const me = asyncHandler(async (req, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new ApiError(401, "Token de autenticación requerido");
  }

  const user = await prisma.user.findUnique({ where: { id: authReq.user.id } });
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  res.json({ user: toSafeUser(user) });
});

export const updateMe = asyncHandler(async (req, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    throw new ApiError(401, "Token de autenticación requerido");
  }

  const { name, email, password, currentPassword } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
  };

  const user = await prisma.user.findUnique({ where: { id: authReq.user.id } });
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  const data: any = {};

  if (name) data.name = name.trim();
  if (email) {
    const normalized = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing && existing.id !== user.id) {
      throw new ApiError(409, "Este correo electrónico ya está registrado");
    }
    data.email = normalized;
  }
  if (password) {
    if (user.passwordHash) {
      if (!currentPassword) {
        throw new ApiError(400, "Debes indicar la contraseña actual para cambiarla");
      }
      const valid = await comparePassword(currentPassword, user.passwordHash);
      if (!valid) {
        throw new ApiError(401, "Contraseña actual incorrecta");
      }
    }
    data.passwordHash = await hashPassword(password);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  res.json({ user: toSafeUser(updated) });
});
