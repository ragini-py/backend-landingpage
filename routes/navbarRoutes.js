const express = require("express");
const router = express.Router();
const NavbarButtons = require("../models/navbarButtons");
const adminAuth = require("../middleware/adminAuth");

// ✅ READ all navbar buttons (public)
router.get("/", async (req, res) => {
  try {
    const buttons = await NavbarButtons.find();
    res.json(buttons);
  } catch (err) {
    console.error("Fetch navbar buttons error:", err);
    res.status(500).json({ error: "Failed to fetch navbar buttons" });
  }
});

// ✅ CREATE a new navbar button (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const button = new NavbarButtons(req.body);
    await button.save();
    res.json(button);
  } catch (err) {
    console.error("Navbar POST error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ UPDATE a navbar button (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const button = await NavbarButtons.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!button) return res.status(404).json({ error: "Button not found" });
    res.json(button);
  } catch (err) {
    console.error("Navbar PUT error:", err);
    res.status(400).json({ error: "Failed to update navbar button" });
  }
});

// ✅ DELETE a navbar button (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await NavbarButtons.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Button not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Navbar DELETE error:", err);
    res.status(400).json({ error: "Failed to delete navbar button" });
  }
});

module.exports = router;
