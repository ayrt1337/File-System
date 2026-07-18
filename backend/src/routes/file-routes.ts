import { Router } from "express";
import { FileController } from "../controllers/file.js";
import { FileConvertorController } from "../controllers/file-convertors.js";
import { authenticate } from "../middlewares/authenticate-middleware.js";
import { DownloadVideosController } from "../controllers/download-videos.js";
import multer from "multer";
import { ROUTES } from "../routing/routes.js";

const fileRoutes = Router();
const fileController = new FileController();
const fileConvertorController = new FileConvertorController();
const downloadVideosController = new DownloadVideosController();

const upload = multer({ storage: multer.memoryStorage() });

fileRoutes.use(authenticate);

fileRoutes.get(ROUTES.FILE.MY_FILES, fileController.getMyFiles);
fileRoutes.get(ROUTES.FILE.DOWNLOAD_VIDEO, downloadVideosController.download);
fileRoutes.post(ROUTES.FILE.CONVERT, upload.single("file"), fileConvertorController.convert);
fileRoutes.post(ROUTES.FILE.UPLOAD_URL, fileController.getUploadUrl);
fileRoutes.get(ROUTES.FILE.DOWNLOAD, fileController.getDownloadUrl);
fileRoutes.patch(ROUTES.FILE.RENAME, fileController.renameFile);
fileRoutes.patch(ROUTES.FILE.STATUS, fileController.updateFileStatus);
fileRoutes.patch(ROUTES.FILE.FAVORITE, fileController.updateFavoriteStatus);

export default fileRoutes;
