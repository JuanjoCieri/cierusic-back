import { Router } from "express";
import {
  getLoggedUser,
  getUserDetail,
  postUserLogin,
  postUserLogout,
  postUserRegister,
  searchByName,
} from "../utils/controllers/users.controllers.js";

const router = Router();

router.get("/users/getLoggedUser", getLoggedUser);
router.get("/users/getUserDetail/:id", getUserDetail);
router.get("/users/postUserLogout", postUserLogout)
router.post("/users/postUserRegister", postUserRegister);
router.post("/users/postUserLogin", postUserLogin);
router.get("/search", searchByName);

export default router;