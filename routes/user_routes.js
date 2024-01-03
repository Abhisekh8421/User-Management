import express from "express";
import { upload } from "../middlewares/multer_middleware.js";
import {
  LoginUser,
  LogoutUser,
  RegisterUser,
} from "../controllers/user_controller.js";
import isAuthenticated from "../middlewares/user_Auth.js";

const router = express.Router();

router.route("/register").post(upload.single("ProfileImage"), RegisterUser);

router.route("/login").post(LoginUser);

router.route("/logout").get(isAuthenticated, LogoutUser);

export default router;
