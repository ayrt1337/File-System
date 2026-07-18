import { Router } from "express";
import { AuthController } from "../controllers/auth.js";
import { authenticate } from "../middlewares/authenticate-middleware.js";
import {
  registerSchema,
  resetPasswordSchema,
  sendEmailSchema,
} from "../schemas/auth-schema.js";
import { validate } from "../middlewares/validate-middleware.js";
import { ROUTES } from "../routing/routes.js";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post(ROUTES.AUTH.LOGIN, authController.login);
authRoutes.post(ROUTES.AUTH.REGISTER, validate(registerSchema), authController.register);
authRoutes.post(ROUTES.AUTH.RESET, validate(sendEmailSchema), authController.reset);
authRoutes.post(ROUTES.AUTH.RESET_PASSWORD, validate(resetPasswordSchema), authController.resetPassword);
authRoutes.get(ROUTES.AUTH.CONFIRM_EMAIL, authController.confirmEmail);
authRoutes.get(ROUTES.AUTH.LOGOUT, authenticate, authController.logout);
authRoutes.get(ROUTES.AUTH.ME, authenticate, authController.verify);

export default authRoutes;
