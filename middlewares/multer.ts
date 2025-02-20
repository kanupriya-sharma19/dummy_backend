import multer, { FileFilterCallback } from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { Request } from "express";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const format = file.mimetype.replace("image/", ""); 
    if (!["jpg", "jpeg", "png", "gif"].includes(format)) {
      throw new Error("Unsupported file format");
    }
    return {
      folder: "playpals",
      format, 
      public_id: `${Date.now()}-${path.parse(file.originalname).name.replace(/\s+/g, "_")}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 7 * 1024 * 1024, 
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export default upload;