import aws from "aws-sdk";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
import multer from "multer";
import busboy from "busboy";
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



// // Large files Upload (Multiple Files) ---------------
// export const uploadLargeFile = (req, res) => {
//   try {
//     const bb = busboy({ headers: req.headers });

//     // KEY CHANGE: Initialize an array to hold all upload promises
//     const uploadPromises = [];

//     bb.on("file", (name, file, info) => {
//       const { filename, mimeType } = info;
      
//       // OPTIONAL: You can log the start of each file upload
//       console.log(`Starting upload for: ${filename}`); 

//       const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         // Ensure keys are unique across all concurrent uploads
//         Key: `uploads/projects/${Date.now()}-${filename}`, 
//         Body: file, // <-- STREAM
//         ContentType: mimeType,
//       };

//       // KEY CHANGE: Push each upload promise to the array
//       const uploadPromise = s3.upload(params).promise();
//       uploadPromises.push(uploadPromise);
//     });

//     bb.on("close", async () => {
//       try {
//         // KEY CHANGE: Wait for ALL promises in the array to resolve
//         // 'results' will be an array containing the data for each successful S3 upload
//         const results = await Promise.all(uploadPromises); 

//         // Send back the array of results
//         return res.json({ status: "success", result: results });
//       } catch (err) {
//         // If ANY promise fails, the catch block executes
//         console.error('One or more S3 uploads failed:', err);
//         return res.status(500).json({ 
//           status: "error", 
//           message: "One or more files failed to upload to S3.", 
//           error: err.message 
//         });
//       }
//     });

//     // Pipe the request stream to Busboy to start parsing
//     req.pipe(bb);
//   } catch (error) {
//     res.status(500).json({ error: "Upload failed", message: error.message });
//   }
// };



export const uploadLargeFile = (req, res) => {
  try {
    const bb = busboy({ headers: req.headers });

    let projectName = "";
    let fileCount = 0;
    const uploadPromises = [];

    // Read text fields
    bb.on("field", (name, value) => {
      if (name === "projectName") {
        projectName = value.trim().replace(/\s+/g, "-").toLowerCase();
        console.log("Project Name:", projectName);
      }
    });

    bb.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;

      if (!filename) {
        file.resume();
        return;
      }

      if (!projectName) {
        console.log(" No projectName, file skipped");
        file.resume();
        return;
      }

      fileCount++;
      console.log(`Uploading: ${filename}`);

      const s3Key = `uploads/projects/${projectName}/${Date.now()}-${filename}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: file,
        ContentType: mimeType,
      };

      const uploadPromise = s3
        .upload(params)
        .promise()
        .then((data) => ({
          originalName: filename,
          key: data.Key,
          location: data.Location,
        }));

      uploadPromises.push(uploadPromise);
    });

    bb.on("close", async () => {
      if (!projectName) {
        return res.status(400).json({
          status: "error",
          message: "projectName is required.",
        });
      }

      if (fileCount === 0) {
        return res.status(400).json({
          status: "error",
          message: "No files uploaded.",
        });
      }

      try {
        const uploaded = await Promise.all(uploadPromises);

        return res.json({
          status: "success",
          folder: projectName,
          count: uploaded.length,
          result: uploaded,
        });
      } catch (err) {
        return res.status(500).json({
          status: "error",
          message: "One or more files failed to upload.",
          error: err.message,
        });
      }
    });

    req.pipe(bb);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error during upload.",
      error: error.message,
    });
  }
};

// Get All Projects (Each folder = one project)
export const getAllProjects = async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: "uploads/projects/",
      Delimiter: "/",
    };

    const data = await s3.listObjectsV2(params).promise();

    const projects =
      data.CommonPrefixes?.map(p =>
        p.Prefix.replace("uploads/projects/", "").replace("/", "")
      ) || [];

    return res.json({ status: "success", projects });
  } catch (error) {
    console.error("S3 LIST ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};


// Get all files inside a project folder
export const getProjectFiles = async (req, res) => {
  try {
    const { projectName } = req.params;

    if (!projectName) {
      return res.status(400).json({ status: "error", message: "Project name required" });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: `uploads/projects/${projectName}/`
    };

    const data = await s3.listObjectsV2(params).promise();

    const files = data.Contents
      .filter(item => item.Key !== params.Prefix) // remove the folder itself
      .map(item => ({
        fileName: item.Key.replace(params.Prefix, ""),
        url: s3.getSignedUrl("getObject", {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: item.Key,
          Expires: 3600, // 1 hour signed URL
        })
      }));

    res.json({ status: "success", files });

  } catch (error) {
    console.error("S3 FILE LIST ERROR:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch project files",
      error: error.message,
    });
  }
};


