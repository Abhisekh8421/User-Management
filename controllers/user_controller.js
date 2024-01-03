import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user_model.js";
import { ApiError } from "../utils/ApiError.js";

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
