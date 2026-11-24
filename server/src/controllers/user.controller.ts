import { Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../middlewares/errorHandler";
import { hashPassword } from "../utils/auth";
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

export const getUsers = asyncHandler(async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(users.map(toSafeUser));
});

export const getUserById = asyncHandler(async (req, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new ApiError(400, "El id de usuario debe ser numérico");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  res.json({ user: toSafeUser(user) });
});

export const createUser = asyncHandler(async (req, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: string;
  };

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
      role: role === "admin" ? "admin" : "user",
    },
  });

  res.status(201).json({ user: toSafeUser(user) });
});

export const updateUser = asyncHandler(async (req, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new ApiError(400, "El id de usuario debe ser numérico");
  }

  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  const user = await prisma.user.findUnique({ where: { id } });
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
  if (role === "admin" || role === "user") data.role = role;
  if (password) data.passwordHash = await hashPassword(password);

  const updated = await prisma.user.update({ where: { id }, data });
  res.json({ user: toSafeUser(updated) });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new ApiError(400, "El id de usuario debe ser numérico");
  }

  if (req.user?.id === id) {
    throw new ApiError(400, "No puedes eliminar tu propia cuenta");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: "Usuario eliminado correctamente" });
});
