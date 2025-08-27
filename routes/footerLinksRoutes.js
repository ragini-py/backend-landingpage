const express = require("express");
const router = express.Router();
const FooterLinks = require("../models/footerLinks");
const adminAuth = require("../middleware/adminAuth");

// ✅ READ all (public)
router.get("/", async (req, res) => {
  try {
    const links = await FooterLinks.find();
    res.json(links);
  } catch (err) {
    console.error("Fetch footer links error:", err);
    res.status(500).json({ error: "Failed to fetch footer links" });
  }
});

// ✅ CREATE new (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const link = new FooterLinks(req.body);
    await link.save();
    res.status(201).json(link);
  } catch (err) {
    console.error("Create footer link error:", err);
    res.status(400).json({ error: "Failed to create footer link" });
  }
});

// ✅ UPDATE existing (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const link = await FooterLinks.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!link) return res.status(404).json({ error: "Link not found" });
    res.json(link);
  } catch (err) {
    console.error("Update footer link error:", err);
    res.status(400).json({ error: "Failed to update footer link" });
  }
});

// ✅ DELETE (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await FooterLinks.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Link not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete footer link error:", err);
    res.status(400).json({ error: "Failed to delete footer link" });
  }
});

module.exports = router;
