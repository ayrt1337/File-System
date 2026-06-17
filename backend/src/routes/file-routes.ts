import { Router } from "express";
import { FileController } from "../controllers/file.js";
import { FileConvertorController } from "../controllers/file-convertors.js";
import { authenticate } from "../middlewares/authenticate-middleware.js";
import { DownloadVideosController } from "../controllers/download-videos.js";
import multer from "multer";

const fileRoutes = Router();
const fileController = new FileController();
const fileConvertorController = new FileConvertorController();
const downloadVideosController = new DownloadVideosController();

const upload = multer({ storage: multer.memoryStorage() });

fileRoutes.use(authenticate);

fileRoutes.get("/my-files", fileController.getMyFiles);
fileRoutes.get("/download-video", downloadVideosController.download);
fileRoutes.post("/convert", upload.single("file"), fileConvertorController.convert);

export default fileRoutes;
