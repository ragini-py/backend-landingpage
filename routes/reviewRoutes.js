const express = require("express");
const router = express.Router();
const { upload, uploadToS3, deleteFromS3 } = require("../config/uploadS3");
const Review = require("../models/review");

// CREATE with avatar upload
router.post("/", upload.single("avatar"), async (req, res) => {
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

// READ all
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// READ single by ID
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// UPDATE review by ID (partial update, optional avatar)
router.put("/:id", upload.single("avatar"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // If a new avatar is uploaded → replace old one
    if (req.file) {
      const oldKey = review.avatar.split(".amazonaws.com/")[1];
      await deleteFromS3(oldKey);
      review.avatar = await uploadToS3(req.file);
    }

    // Update only the fields provided
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

// DELETE review
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const fileKey = review.avatar.split(".amazonaws.com/")[1];
    await deleteFromS3(fileKey);

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete review" });
  }
});

// DELETE ALL reviews (and avatars from S3)
router.delete("/", async (req, res) => {
  try {
    const reviews = await Review.find();

    // delete each avatar from S3
    for (const review of reviews) {
      if (review.avatar) {
        const fileKey = review.avatar.split(".amazonaws.com/")[1];
        await deleteFromS3(fileKey);
      }
    }

    await Review.deleteMany({}); // clear all docs
    res.json({ success: true, message: "All reviews deleted" });
  } catch (err) {
    console.error("Delete all error:", err);
    res.status(500).json({ error: "Failed to delete all reviews" });
  }
});

module.exports = router;
