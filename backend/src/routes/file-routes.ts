import { Router } from "express";
import { FileController } from "../controllers/file.js";
import { FileConvertorController } from "../controllers/file-convertors.js";
import { authenticate } from "../middlewares/authenticate-middleware.js";
import multer from "multer";

const fileRoutes = Router();
const fileController = new FileController();
const fileConvertorController = new FileConvertorController();

const upload = multer({ storage: multer.memoryStorage() });

fileRoutes.use(authenticate);

fileRoutes.get("/my-files", fileController.getMyFiles);
fileRoutes.post("/convert", upload.single("file"), fileConvertorController.convert);

export default fileRoutes;
