import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDNAME, // replace  with your cloudinary  cloud name
  api_key: process.env.API_KEY, // replace with your cloudinary API key
  api_secret: process.env.API_SECRET, // replace with your cloudinary API Secret
});

export const uploadOnCloudinary = async (localpath) => {
  try {
    console.log("localpath", localpath);
    if (!localpath) return null;
    const responce = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localpath);
    // console.log("response", responce); for debugging purpose
    return responce;
  } catch (error) {
    console.log("error is encountered ", error.message);
    fs.unlinkSync(localpath);
    return null;
  }
};
