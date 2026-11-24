import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import orderRoutes from "./routes/order.routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(
  cors({
    origin: CLIENT_URL ? [CLIENT_URL] : true,
    credentials: true,
  })
);
app.use(express.json());

// API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

// Frontend compilado (solo existe tras `npm run build:client`)
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});

export default app;
