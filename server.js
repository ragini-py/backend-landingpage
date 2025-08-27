const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const PORT = process.env.PORT || 5123;

// Initialize app
const app = express();

// Connect to DB
connectDB();

// ✅ Enable CORS
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite dev
    "http://localhost:3000", // Next.js default
    "http://localhost:3001", // your current Next.js dev
    "https://your-frontend-domain.com" // deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
const bgcarouselRoutes = require("./routes/bgcarouselRoutes");
const storeLinksRoutes = require("./routes/storeLinksRoutes");
const footerLinksRoutes = require("./routes/footerLinksRoutes");
const navbarRoutes = require("./routes/navbarRoutes");
const socialLinksRoutes = require("./routes/socialLinksRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Public route for login/register
app.use("/api/auth", require("./routes/authRoutes"));

// ✅ All routes handle their own auth
app.use("/api/bgcarousel", bgcarouselRoutes);
app.use("/api/store-links", storeLinksRoutes);
app.use("/api/footer-links", footerLinksRoutes);
app.use("/api/navbar", navbarRoutes);
app.use("/api/social-links", socialLinksRoutes);
app.use("/api/reviews", reviewRoutes);

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
