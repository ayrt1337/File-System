import express from "express";
import cors from "cors";
import database from "./config/database.js";
import { User } from "./types/user.js";

const options = {
    origin: "http://localhost:5173/"
};

const app = express();

app.use(express.json());
app.use(cors(options));