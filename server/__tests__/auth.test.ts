/// <reference types="jest" />
import request from "supertest";
import app from "../src/index";
import { prisma } from "../src/utils/prisma";

// Evitar que el servidor se quede levantado por app.listen
jest.mock("../src/index", () => {
  const express = require("express");
  const cors = require("cors");
  const productRoutes = require("../src/routes/product.routes").default;
  const categoryRoutes = require("../src/routes/category.routes").default;
  const authRoutes = require("../src/routes/auth.routes").default;
  const userRoutes = require("../src/routes/user.routes").default;
  const { errorHandler, notFoundHandler } = require("../src/middlewares/errorHandler");

  const mockApp = express();
  mockApp.use(cors());
  mockApp.use(express.json());
  mockApp.get("/api/health", (_req: any, res: any) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  mockApp.use("/api/auth", authRoutes);
  mockApp.use("/api/users", userRoutes);
  mockApp.use("/api/products", productRoutes);
  mockApp.use("/api/categories", categoryRoutes);
  mockApp.use(notFoundHandler);
  mockApp.use(errorHandler);
  return mockApp;
});

const TEST_EMAIL = `test-${Date.now()}@estante.test`;
const TEST_PASSWORD = "Password123!";

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe("Auth API", () => {
  it("registra un usuario y devuelve token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect((res.body.user as any).passwordHash).toBeUndefined();
  });

  it("no permite registrar email duplicado", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/correo/i);
  });

  it("login con credenciales correctas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rechaza login con contraseña incorrecta", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/correo|contraseña/i);
  });

  it("devuelve perfil con token válido", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const token = loginRes.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  it("rechaza acceso sin token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
