import { Router } from "express";
import { login, me, register, updateMe } from "../controllers/auth.controller";
import { oauthCallback, oauthLinkConfirm, oauthStart } from "../controllers/oauth.controller";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema, updateProfileSchema } from "../schemas/auth.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register as any));
router.post("/login", validate(loginSchema), asyncHandler(login as any));
router.get("/me", requireAuth, asyncHandler(me as any));
router.put("/me", requireAuth, validate(updateProfileSchema as any), asyncHandler(updateMe as any));
router.post("/link/confirm", asyncHandler(oauthLinkConfirm as any));
router.get("/:provider", asyncHandler(oauthStart as any));
router.get("/:provider/callback", asyncHandler(oauthCallback as any));

export default router;
