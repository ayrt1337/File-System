import { Router } from "express";
import { User } from "../controllers/user.js";
import { authenticate } from "../middlewares/authenticate-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { updateProfileSchema } from "../schemas/profile.schema.js";

const userRoutes = Router();
const userController = new User();

userRoutes.use(authenticate);

userRoutes.get("/profile", userController.getProfile);
userRoutes.patch("/update", validate(updateProfileSchema), userController.update);
userRoutes.patch("/delete", userController.delete);

export default userRoutes;
