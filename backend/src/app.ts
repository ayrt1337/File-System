import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import route from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error-middleware.js";
import helmet from "helmet";
import { startUploadWorker } from "./services/upload-worker.js";

const options = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
 };

const app = express();

app.use(express.json());
app.use(cors(options));
app.use(cookieParser());
app.use(helmet());

app.use(route);
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Started at ${port}`);
  startUploadWorker().catch((error) => {
    console.error("Erro fatal ao rodar worker do SQS:", error);
  });
});
