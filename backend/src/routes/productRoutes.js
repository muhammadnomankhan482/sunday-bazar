const express = require("express");
const Product = require("../models/Product");
const upload = require("../middleware/upload");
const { uploadToCloudinary } = require("../config/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /products — list with pagination
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({
      products: products.map((p) => p.toJSON()),
      total,
      skip,
      limit,
      page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /products/search?q=
router.get("/search", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();

    if (!query) {
      return res.json({ products: [], total: 0, skip: 0, limit: 30 });
    }

    const regex = new RegExp(query, "i");
    const products = await Product.find({
      $or: [{ title: regex }, { description: regex }, { category: regex }],
    }).sort({ createdAt: -1 });

    res.json({
      products: products.map((p) => p.toJSON()),
      total: products.length,
      skip: 0,
      limit: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ productId: Number(req.params.id) });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.toJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /products — auth required + image upload
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        message: "title, description, price, and category are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      thumbnail: result.secure_url,
      images: [result.secure_url],
    });

    res.status(201).json(product.toJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /products/:id
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findOne({ productId: Number(req.params.id) });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { title, description, price, category } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (category) product.category = category;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      product.thumbnail = result.secure_url;
      product.images = [result.secure_url];
    }

    await product.save();
    res.json(product.toJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /products/:id
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      productId: Number(req.params.id),
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted", product: product.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
