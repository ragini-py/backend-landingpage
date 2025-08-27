// models/admin.js
const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    // ✅ For forgot/reset password flow
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
