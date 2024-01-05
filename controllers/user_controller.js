import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user_model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new ApiError(404, "User Does Not Exist");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //save a user instance to the database without triggering the validation process
    return { accessToken, refreshToken };
  } catch (error) {
    // console.error("Error in generateAccessandRefreshToken:", error.message); for debugging process
    throw new ApiError(500, "something went wrong");
  }
};

export const RegisterUser = asyncHandler(async (req, res) => {
  const { username, email, role, phoneNumber, password } = req.body;

  if (
    [username, email, phoneNumber, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required"); //for data validation
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
    profileImage: avatar?.url,
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

export const LoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "email is required!!!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User Doesnot Exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password); //using the instance of User
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "user is successfully logged in"
      )
    );
});

export const LogoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "user logged out"));
});

export const UpdateRefreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESHTOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id); // If the token is valid, it fetches the corresponding user from the database.
    if (!user) {
      throw new ApiError(401, "Invalid Token"); //If the user is not found, it throws an invalid token error.
    }

    if (incomingRefreshToken !== user.refreshToken) {
      // Checks if the incoming refresh token matches the stored refresh token for the user.
      throw new ApiError(401, " refresh Token Expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed successfully"
        )
      );
  } catch (error) {
    // console.log("error is ", error.message); debugging purpose
    throw new ApiError(401, error?.message || "something went wrong");
  }
});

export const UpdateUserDetails = asyncHandler(async (req, res) => {
  try {
    const { username } = req.body;
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

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profileImage: profileImage.url,
          username,
        },
      },
      {
        new: true,
      }
    ).select("-password");
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Updated User Details Successfully"));
  } catch (error) {
    console.log("error is ", error.message);
    throw new ApiError(error.status || 500, "internal server error");
  }
});

export const UserProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        message: `your profile is found: ${req.user.username}`,
        user: req.user,
      },
      "successfully fetched your profile"
    )
  );
});

export const DeleteUserProfile = asyncHandler(async (req, res) => {
  const user = req.user._id;
  await User.findByIdAndDelete(user);
  return res.status(200).json(new ApiResponse(200, {}, "successfully deleted"));
});


