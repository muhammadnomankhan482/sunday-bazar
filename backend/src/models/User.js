const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" }, // Cloudinary image URL
  },
  { timestamps: true }
);

module.exports = mongoose.models.SBUser || mongoose.model("SBUser", userSchema);
