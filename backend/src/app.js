const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const mongoDbRoutes = require("./routes/mongodbRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// CORS — sirf frontend se requests allow karo
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "https://sunday-bazar-xaek.vercel.app",
  "https://sunday-bazar.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Not allowed — " + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.send("Welcome to Sunday Bazar backend — products & Cloudinary uploads ready!");
});

// Auth routes (public)
app.use("/", authRoutes);

// Product & upload routes
app.use("/products", productRoutes);
app.use("/upload", uploadRoutes);
app.use("/mongodb", mongoDbRoutes);

app.use((err, _req, res, _next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = app;
