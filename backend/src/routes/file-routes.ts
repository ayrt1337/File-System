import { Router } from "express";
import { FileController } from "../controllers/file.js";
import { authenticate } from "../middlewares/authenticate.js";

const fileRoutes = Router();
const fileController = new FileController();

fileRoutes.use(authenticate);

fileRoutes.get("/my-files", fileController.getMyFiles);

export default fileRoutes;
