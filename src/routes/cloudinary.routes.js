import express from "express";
import { cloudinary } from "../utils/cloudinary.js";
import upload from "../utils/multer.js"

const router = express.Router();

router.post("/cloud/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result.secure_url)
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al subir la imagen" });
  }
});

export default router;
