import { Router } from "express";
import { User } from "../controllers/user.js";
import { authenticate } from "../middlewares/authenticate.js";

const userRoutes = Router();
const userController = new User();

userRoutes.use(authenticate);

userRoutes.get("/profile", userController.getProfile);
userRoutes.patch("/update", userController.update);
userRoutes.patch("/delete", userController.delete);

export default userRoutes;
