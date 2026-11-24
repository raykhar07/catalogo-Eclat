import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireRole } from "../middlewares/auth";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "../schemas/user.schema";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), asyncHandler(getUsers as any));
router.get("/:id", requireAuth, requireRole("admin"), validate(userIdParamSchema as any, "params"), asyncHandler(getUserById as any));
router.post("/", requireAuth, requireRole("admin"), validate(createUserSchema), asyncHandler(createUser as any));
router.put("/:id", requireAuth, requireRole("admin"), validate(userIdParamSchema as any, "params"), validate(updateUserSchema), asyncHandler(updateUser as any));
router.delete("/:id", requireAuth, requireRole("admin"), validate(userIdParamSchema as any, "params"), asyncHandler(deleteUser as any));

export default router;
