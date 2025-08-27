const express = require("express");
const router = express.Router();
const StoreLinks = require("../models/storeLinks");
const adminAuth = require("../middleware/adminAuth");

// ✅ CREATE (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const link = new StoreLinks(req.body); // { type, url }
    await link.save();
    res.json(link);
  } catch (err) {
    console.error("Create store link error:", err);
    res.status(400).json({ error: "Failed to create store link" });
  }
});

// ✅ READ all (public)
router.get("/", async (req, res) => {
  try {
    const links = await StoreLinks.find();
    res.json(links);
  } catch (err) {
    console.error("Fetch store links error:", err);
    res.status(500).json({ error: "Failed to fetch store links" });
  }
});

// ✅ UPDATE by ID (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const link = await StoreLinks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!link) return res.status(404).json({ error: "Store link not found" });
    res.json(link);
  } catch (err) {
    console.error("Update store link error:", err);
    res.status(400).json({ error: "Failed to update store link" });
  }
});

// ✅ DELETE by ID (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await StoreLinks.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Store link not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete store link error:", err);
    res.status(400).json({ error: "Failed to delete store link" });
  }
});

module.exports = router;
