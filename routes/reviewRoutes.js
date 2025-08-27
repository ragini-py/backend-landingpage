const express = require("express");
const router = express.Router();
const { upload, uploadToS3, deleteFromS3 } = require("../config/uploadS3");
const Review = require("../models/review");
const adminAuth = require("../middleware/adminAuth");

// ✅ CREATE with avatar upload (admin only)
router.post("/", adminAuth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Avatar is required" });

    const avatarUrl = await uploadToS3(req.file);

    const review = new Review({
      name: req.body.name,
      game: req.body.game,
      comment: req.body.comment,
      rating: req.body.rating,
      date: req.body.date,
      avatar: avatarUrl
    });

    await review.save();
    res.json(review);
  } catch (err) {
    console.error("Review POST error:", err);
    res.status(400).json({ error: "Failed to create review" });
  }
});

// ✅ READ all (public)
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Fetch reviews error:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ✅ READ single by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    console.error("Fetch review by ID error:", err);
    res.status(400).json({ error: "Invalid ID" });
  }
});

// ✅ UPDATE review by ID (admin only)
router.put("/:id", adminAuth, upload.single("avatar"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Replace avatar if a new one is uploaded
    if (req.file) {
      const oldKey = review.avatar.split(".amazonaws.com/")[1];
      await deleteFromS3(oldKey);
      review.avatar = await uploadToS3(req.file);
    }

    // Update only provided fields
    if (req.body.name) review.name = req.body.name;
    if (req.body.game) review.game = req.body.game;
    if (req.body.comment) review.comment = req.body.comment;
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.date) review.date = req.body.date;

    await review.save();
    res.json(review);
  } catch (err) {
    console.error("Review PUT error:", err);
    res.status(400).json({ error: "Failed to update review" });
  }
});

// ✅ DELETE single review (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const fileKey = review.avatar.split(".amazonaws.com/")[1];
    await deleteFromS3(fileKey);

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(400).json({ error: "Failed to delete review" });
  }
});

// ✅ DELETE ALL reviews (admin only)
router.delete("/", adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find();

    for (const review of reviews) {
      if (review.avatar) {
        const fileKey = review.avatar.split(".amazonaws.com/")[1];
        await deleteFromS3(fileKey);
      }
    }

    await Review.deleteMany({});
    res.json({ success: true, message: "All reviews deleted" });
  } catch (err) {
    console.error("Delete all reviews error:", err);
    res.status(500).json({ error: "Failed to delete all reviews" });
  }
});

module.exports = router;
