import { Router } from "express";
import authRoutes from "./auth-routes.js";
import userRoutes from "./user-routes.js";
import fileRoutes from "./file-routes.js";

const route = Router();

route.use("/", authRoutes);
route.use("/", userRoutes);
route.use("/", fileRoutes);

export default route;