import express from "express";
import { upload } from "../middlewares/multer_middleware.js";
import {
  DeleteUserProfile,
  LoginUser,
  LogoutUser,
  RegisterUser,
  UpdateRefreshAccessToken,
  UpdateUserDetails,
  UserProfile,
} from "../controllers/user_controller.js";
import isAuthenticated from "../middlewares/user_Auth.js";

const router = express.Router();

router.route("/register").post(upload.single("ProfileImage"), RegisterUser);

router.route("/login").post(LoginUser);

router.route("/logout").get(isAuthenticated, LogoutUser);

router.route("/refresh-token").post(UpdateRefreshAccessToken);

router
  .route("/updateUser")
  .put(isAuthenticated, upload.single("profileImage"), UpdateUserDetails);

router.route("/user-profile").get(isAuthenticated, UserProfile);

router.route("/delete-profile").delete(isAuthenticated, DeleteUserProfile);

export default router;
