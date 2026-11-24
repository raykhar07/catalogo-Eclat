import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { validate } from "../middlewares/validate";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", asyncHandler(categoryController.getCategories));

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(createCategorySchema),
  asyncHandler(categoryController.createCategory)
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(updateCategorySchema),
  asyncHandler(categoryController.updateCategory)
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(categoryController.deleteCategory)
);

export default router;
