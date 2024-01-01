import { asyncHandler } from "../utils/asyncHandler.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user_model.js";
import { ApiError } from "../utils/ApiError.js";

export const RegisterUser = asyncHandler(async (req, res) => {
  const { username, email, role, phoneNumber, password } = req.body;

  if (
    [username, email, phoneNumber, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");//for data validation 
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }], //checking for existed User in database
  });
  if (existedUser) {
    return res.status(400).json({
      success: false,
      message: "User Already Exists",
    });
  }

  const UserAvatarLocalPath = req.file.path;
  // console.log("avatar local path", UserAvatarLocalPath); for debugging purposes 

  if (!UserAvatarLocalPath) {
    throw new ApiError(400, "Avatar local path is required");
  }

  const avatar = await uploadOnCloudinary(UserAvatarLocalPath);
  // console.log("Avatar clodinary path", avatar); for debugging purpose

  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar to Cloudinary");
  }

  const user = await User.create({
    username,
    ProfileImage: avatar?.url,
    email,
    password,
    phoneNumber,
    role,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registration");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully"));
});
