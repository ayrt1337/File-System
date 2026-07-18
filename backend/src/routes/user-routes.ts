import { Router } from "express";
import { UserController } from "../controllers/user.js";
import { authenticate } from "../middlewares/authenticate-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { updateProfileSchema } from "../schemas/profile-schema.js";
import { ROUTES } from "../routing/routes.js";

const userRoutes = Router();
const userController = new UserController();

userRoutes.use(authenticate);

userRoutes.get(ROUTES.USER.PROFILE, userController.getProfile);
userRoutes.patch(ROUTES.USER.UPDATE, validate(updateProfileSchema), userController.update);
userRoutes.patch(ROUTES.USER.DELETE, userController.delete);

export default userRoutes;
