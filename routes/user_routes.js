import express from "express";
import { upload } from "../middlewares/multer_middleware.js";
import { LoginUser, RegisterUser } from "../controllers/user_controller.js";
import isAuthenticated from "../middlewares/user_Auth.js";

const router = express.Router();

router.route("/register").post(upload.single("ProfileImage"), RegisterUser);

router.route("/login").post(LoginUser);

export default router;
