import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadOnCloudinary = async (localpath) => {
  try {
    if (!localpath) return null;
    const responce = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localpath);
    return responce;
  } catch (error) {
    console.log("error is encountered ", error.message);
    fs.unlinkSync(localpath);
    return null;
  }
};
