import aws from "aws-sdk";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
import multer from "multer";
const { S3 } = aws;
dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3Uploadv2 = async (files) => {
  const params = files.map((file) => ({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${uuid()}-${file.originalname}`,
    Body: file.buffer,
  }));

  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5, files: 2 } });

export const uploadFiles = async (req, res) => {
  try {
    const results = await s3Uploadv2(req.files);
    console.log(results);
    return res.json({
      status: "success",
      results,
    });
  } catch (err) {
    console.error("Error uploading files:", err);
    return res.status(500).json({
      status: "error",
      message: "File upload failed",
      error: err.message,
    });
  }
};

export const getImage =  (req, res) => {
  const key = req.params.key;
  const Bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  const imageUrl = `https://${Bucket}.s3.${region}.amazonaws.com/${key}`;

  s3.headObject({ Bucket, Key: key }, (err) => {
    if (err && err.code === "NotFound") {
      return res.status(404).json({ message: "Image not found" });
    } else if (err) {
      return res.status(500).json({ message: "Error checking image", error: err.message });
    }
    return res.json({ url: imageUrl });
  });
};



