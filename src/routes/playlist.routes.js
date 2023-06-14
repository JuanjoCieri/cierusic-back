import { Router } from "express";
import {
  getForYouPlaylist,
  getLikedUserPlaylists,
  postAddSongToPlaylist,
  postCommentPlaylist,
  postCreatePlaylist,
  postLikePlaylist,
  getPlaylistDetail
} from "../utils/controllers/playlist.controllers.js";

const router = Router();

router.get("/playlist/getForYouPlaylist", getForYouPlaylist);
router.get("/playlist/getLikedUserPlaylists", getLikedUserPlaylists);
router.get("/playlist/getPlaylistDetail/:id", getPlaylistDetail);
router.post("/playlist/postCreatePlaylist", postCreatePlaylist);
router.post("/playlist/postAddSongToPlaylist", postAddSongToPlaylist);
router.post("/playlist/postCommentPlaylist", postCommentPlaylist);
router.post("/playlist/postLikePlaylist", postLikePlaylist);

export default router;
