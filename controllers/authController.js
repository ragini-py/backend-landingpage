const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Admin = require("../models/admin");

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(admin);
    res.json({
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ name, email, password: hashedPassword, phone, role: "admin" });
    await admin.save();

    const token = generateToken(admin);

    res.status(201).json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, role: admin.role },
      message: "✅ Admin registered successfully"
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "No admin found with this email" });

    // generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min

    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpiry = resetTokenExpiry;
    await admin.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // ✅ build transporter dynamically
    let transporter;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Gmail / real SMTP
      transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
    } else {
      // Ethereal fallback for dev
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER || "no-reply@test.com"}>`,
      to: admin.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    // Log ethereal preview if using test account
    if (!process.env.EMAIL_USER) {
      console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
    }

    res.json({ message: "✅ Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!admin) return res.status(400).json({ message: "Invalid or expired token" });

    admin.password = await bcrypt.hash(password, 10);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpiry = undefined;
    await admin.save();

    res.json({ message: "✅ Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
