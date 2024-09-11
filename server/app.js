const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const cors = require("cors");
require("express-async-errors");

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB,
  fileFilter: async (req, file, cb) => {
    // Validate that the file is an image
    const filetypes = /jpeg|jpg|png|gif|bmp|svg+xml|x-icon/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (!(mimetype && extname)) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type"));
    } else {
      cb(null, true);
    }
  },
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const rotatedImageBuffer = await sharp(filePath)
      .jpeg()
      .rotate(90)
      .toBuffer();

      res.writeHead(200, {
        'Content-Type': req.file.mimetype,
        'Content-Length': rotatedImageBuffer.length,
      });
      res.end(rotatedImageBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
});

//error handler middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send(err.field);
  }
  console.error(err);
  return res.status(500).send("Something went wrong");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
