const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const mongoDbRoutes = require("./routes/mongodbRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.send("Welcome to OLX PRO backend — products & Cloudinary uploads ready!");
});

app.use("/products", productRoutes);
app.use("/upload", uploadRoutes);
app.use("/mongodb" , mongoDbRoutes)

app.use((err, _req, res, _next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = app;
