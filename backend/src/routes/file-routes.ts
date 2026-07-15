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
fileRoutes.post("/upload-url", fileController.getUploadUrl);
fileRoutes.get("/files/download/:id", fileController.getDownloadUrl);
fileRoutes.patch("/files/rename", fileController.renameFile);
fileRoutes.patch("/files/status", fileController.updateFileStatus);
fileRoutes.patch("/files/favorite", fileController.updateFavoriteStatus);

export default fileRoutes;
