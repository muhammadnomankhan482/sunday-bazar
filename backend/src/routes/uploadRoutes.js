const express = require("express");
const upload = require("../middleware/upload");
const { uploadToCloudinary } = require("../config/cloudinary");

const router = express.Router();

// POST /upload — single image
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /upload/multiple — up to 5 images
router.post("/multiple", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const uploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );

    res.status(201).json({
      images: uploads.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
