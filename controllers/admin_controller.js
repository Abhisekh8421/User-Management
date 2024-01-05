import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user_model.js";
import { ApiError } from "../utils/ApiError.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  if (!(req.user.role == "Admin")) {
    throw new ApiError(401, "Access denied"); //checking the user is a admin or not
  }
  const users = await User.find({}).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: users,
      },
      "Successfully feteched all Users"
    )
  );
});

export const getUserByid = asyncHandler(async (req, res) => {
  if (!(req.user.role == "Admin")) {
    throw new ApiError(401, "Access denied"); //checking the user is a admin or not
  }
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User is Not Found");
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        UserDetails: user,
      },
      "User details fetched successfully"
    )
  );
});

export const deleteUserByid = asyncHandler(async (req, res) => {
  if (!(req.user.role == "Admin")) {
    throw new ApiError(401, "Access denied"); //checking the user is a admin or not
  }
  const { userId } = req.params;

  const deletedUser = await User.findByIdAndDelete(userId).select(
    "-password -refreshToken"
  );
  if (!deletedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedUser, "User Deleted Successfully"));
});

export const UpdateUserById = asyncHandler(async (req, res) => {
  if (!(req.user.role == "Admin")) {
    throw new ApiError(401, "Access denied"); //checking the user is a admin or not
  }
  const { userId } = req.params;
  const { username, email } = req.body;
  const profileImageLocalPath = req.file?.path;

  if (!username) {
    throw new ApiError(401, "Username is Missing");
  }
  if (!profileImageLocalPath) {
    throw new ApiError(401, "avatar file is Missing");
  }

  const profileImage = await uploadOnCloudinary(profileImageLocalPath);
  if (!profileImage.url) {
    throw new ApiError(400, "error uploading on cloudinary");
  }

  const UpdatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        profileImage: profileImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, UpdatedUser, "Successfully updated the User details")
    );
});
