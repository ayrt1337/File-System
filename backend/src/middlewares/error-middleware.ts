import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error]: ${error.message}`);

  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.message);
  } else {
    res.status(500).json("Internal Server Error");
  }
};