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
  try {
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
        new ApiResponse(
          200,
          UpdatedUser,
          "Successfully updated the User details"
        )
      );
  } catch (error) {
    console.log("error is :", error.message);
  }
});

export const CreateExistingUserToAdmin = asyncHandler(async (req, res) => {
  if (!(req.user.role == "Admin")) {
    throw new ApiError(401, "Access denied"); //checking the user is a admin or not
  }

  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User is Not found");
    }
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          role: "Admin",
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          updatedUser,
        },
        "User role updated successfully"
      )
    );
  } catch (error) {
    console.log("the error is :", error.message); //for debugging purpose
    throw new ApiError(500, "Internal Server Error");
  }
});

export const CreateNewAdmin = asyncHandler(async (req, res) => {
  if (!(req.user.role == "Admin")) {
    throw new ApiError(401, "Access denied"); //checking the user is a admin or not
  }

  const { username, email, phoneNumber, password } = req.body;
  if (
    [username, email, phoneNumber, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required"); //for data validation
  }

  const profileImageLocalPath = req.file.path;
  if (!profileImageLocalPath) {
    throw new ApiError(400, "Profile local path is notfound");
  }
  const profileImage = await uploadOnCloudinary(profileImageLocalPath);

  if (!profileImage) {
    throw new ApiError(400, "error uploading on cloudinary");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    return res.status(400).json({
      success: false,
      message: "User Already Exists",
    });
  }

  const adminUser = await User.create({
    username,
    password,
    phoneNumber,
    email,
    role: "Admin",
    profileImage: profileImage?.url,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        adminUser,
      },
      "Admin account created successfully"
    )
  );
});
