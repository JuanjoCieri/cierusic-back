import express from "express";
import morgan from "morgan";
import setHeaders from "./utils/middlewares/setHeaders.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.routes.js";
import songRoutes from "./routes/songs.routes.js";
import cloudRoutes from "./routes/cloudinary.routes.js";
import cors from "cors";
import playlistRoutes from "./routes/playlist.routes.js";
import * as dotenv from "dotenv";
import createCookie from "./utils/middlewares/createCookie.js";
dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());
app.use(cookieParser());
app.use(createCookie);
app.use(setHeaders);

app.use(
  cors({
    credentials: true,
    origin: "https://cierusic.vercel.app",
    withCredentials: true
  })
);

app.use(userRoutes, songRoutes, playlistRoutes, cloudRoutes);

export default app;
