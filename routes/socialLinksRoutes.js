const express = require("express");
const router = express.Router();
const SocialLinks = require("../models/socialLinks");
const adminAuth = require("../middleware/adminAuth");

// ✅ CREATE (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const link = new SocialLinks(req.body); // { type, url }
    await link.save();
    res.json(link);
  } catch (err) {
    console.error("Create social link error:", err);
    res.status(400).json({ error: "Failed to create social link" });
  }
});

// ✅ READ all (public)
router.get("/", async (req, res) => {
  try {
    const links = await SocialLinks.find();
    res.json(links);
  } catch (err) {
    console.error("Fetch social links error:", err);
    res.status(500).json({ error: "Failed to fetch social links" });
  }
});

// ✅ UPDATE by ID (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const link = await SocialLinks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!link) return res.status(404).json({ error: "Social link not found" });
    res.json(link);
  } catch (err) {
    console.error("Update social link error:", err);
    res.status(400).json({ error: "Failed to update social link" });
  }
});

// ✅ DELETE by ID (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await SocialLinks.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Social link not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete social link error:", err);
    res.status(400).json({ error: "Failed to delete social link" });
  }
});

module.exports = router;
