import { Router } from "express";
import {
  getLikedUserSongs,
  postSong,
  postLikeSong,
  getPlaylistSongs,
  postCommentSong,
  getSongById,
  getUserSongs,
} from "../utils/controllers/songs.controllers.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = Router();

router.get("/songs/getLikedUserSongs/:id", getLikedUserSongs);
router.get("/songs/getUserSongs/:id", getUserSongs);
router.get("/songs/getPlaylistSongs/:id", getPlaylistSongs);
router.get("/songs/getSongById/:id", getSongById);
router.post("/songs/postSong", upload.single("file"), postSong);
router.post("/songs/likeSong", postLikeSong);
router.post("/songs/postCommentSong", postCommentSong);

export default router;
