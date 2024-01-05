import express from "express";
import { upload } from "../middlewares/multer_middleware.js";
import isAuthenticated from "../middlewares/user_Auth.js";
import {
  UpdateUserById,
  deleteUserByid,
  getAllUsers,
  getUserByid,
} from "../controllers/admin_controller.js";

const adminRouter = express.Router();

adminRouter.route("/users").get(isAuthenticated, getAllUsers);

adminRouter
  .route("/users/:userId")
  .get(isAuthenticated, getUserByid)
  .delete(isAuthenticated, deleteUserByid)
  .put(isAuthenticated, upload.single("profileImage"), UpdateUserById);

export default adminRouter;
