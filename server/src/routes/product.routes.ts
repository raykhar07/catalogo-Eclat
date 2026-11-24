import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { validate } from "../middlewares/validate";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "../schemas/product.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get(
  "/",
  validate(listProductsQuerySchema, "query"),
  asyncHandler(productController.getProducts)
);

router.get("/:id", asyncHandler(productController.getProductById));

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(createProductSchema),
  asyncHandler(productController.createProduct)
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(updateProductSchema),
  asyncHandler(productController.updateProduct)
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(productController.deleteProduct)
);

export default router;
