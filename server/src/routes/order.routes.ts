import { Router } from "express";
import { createCartOrder, createOrder, getMyOrders } from "../controllers/order.controller";
import { validate } from "../middlewares/validate";
import { createCartOrderSchema, createOrderSchema } from "../schemas/order.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/me", requireAuth, asyncHandler(getMyOrders as any));
router.post("/", requireAuth, validate(createOrderSchema as any), asyncHandler(createOrder as any));
router.post("/cart", requireAuth, validate(createCartOrderSchema as any), asyncHandler(createCartOrder as any));

export default router;
