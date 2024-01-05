import mongoose from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      index: true, // for performance
      trim: true, //any leading whitespaces will removed before saving the document
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "User"],
      default: "User",
    },
    profileImage: {
      type: String,
    },
    phoneNumber: {
      type: String,
      immutable: true, // field cannot be changed
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESSTOKEN_SECRET,
    {
      expiresIn: process.env.ACCESSTOKEN_SECRET_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESHTOKEN_SECRET,
    {
      expiresIn: process.env.REFRESHTOKEN_SECRET_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
export default User;
