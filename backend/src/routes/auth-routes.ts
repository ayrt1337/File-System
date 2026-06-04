import { Router } from "express";
import { Auth } from "../controllers/auth.js";
import { authenticate } from "../middlewares/authenticate.js";

const authRoutes = Router();
const authController = new Auth();

authRoutes.post("/login", authController.login);
authRoutes.post("/register", authController.register);
authRoutes.post("/reset", authController.reset);
authRoutes.post("/resetPassword", authController.resetPassword);
authRoutes.get("/confirmEmail", authController.confirmEmail);
authRoutes.get("/logout", authenticate, authController.logout);

export default authRoutes;
