import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import User from "../models/user_model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new ApiError(401, "UnAuthorized Request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESSTOKEN_SECRET); //it will give you the basic user credientials
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken" // when we retrieve the user document it comes without password and refresh token
    );

    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    req.user = user;
    next(); // sent the req.user data to next controller
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid User Token");
  }
});

export default isAuthenticated;
