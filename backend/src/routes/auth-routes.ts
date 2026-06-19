import { Router } from "express";
import { AuthController } from "../controllers/auth.js";
import { authenticate } from "../middlewares/authenticate-middleware.js";
import {
  registerSchema,
  resetPasswordSchema,
  sendEmailSchema,
} from "../schemas/auth-schema.js";
import { validate } from "../middlewares/validate-middleware.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.login);
authRoutes.post("/register", validate(registerSchema), authController.register);
authRoutes.post("/reset", validate(sendEmailSchema), authController.reset);
authRoutes.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
authRoutes.get("/confirm-email", authController.confirmEmail);
authRoutes.get("/logout", authenticate, authController.logout);
authRoutes.get("/me", authenticate, authController.verify);

export default authRoutes;
