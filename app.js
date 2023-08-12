import express from "express";

import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config({ path: "./config/config.env" });
const app = express();

//using middelwares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["POST", "GET", "PUT", "DELETE"],
  })
);
//importig and using routers

import course from "./routes/CourseRoutes.js";
import user from "./routes/UserRoutes.js";
import payment from "./routes/paymentRoutes.js";
import other from "./routes/otherRoutes.js";
app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

export default app;
app.use(ErrorMiddleware);
//is error middlewares ko sabse last me use krte haii important haii
