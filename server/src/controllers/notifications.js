// server/controllers/notifications.js
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import Listing from "../models/Listing.js";

// person reviewed you
export const createReviewAndNotify = async (req, res) => {
  try {
    const { listingId, reviewedUserId, rating, comment } = req.body;

    const review = await Review.create({
      listing: listingId,
      reviewer: req.user._id,
      reviewedUser: reviewedUserId,
      rating,
      comment,
    });

    await Notification.create({
      user: reviewedUserId,
      type: "review",
      fromUser: req.user._id,
      listing: listingId,
      message: `${req.user.name} reviewed you with a rating of ${rating} stars.`,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create review and notification",
      error: err.message,
    });
  }
};

// get access to review and notify the user
export const giveAccessAndNotify = async (req, res) => {
  try {
    const { listingId, targetUserId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.reviewAccess = listing.reviewAccess || [];
    if (!listing.reviewAccess.includes(targetUserId)) {
      listing.reviewAccess.push(targetUserId);
      await listing.save();
    }

    await Notification.create({
      user: targetUserId,
      type: "access",
      fromUser: req.user._id,
      listing: listingId,
      message: `${req.user.name} gave you access to review this listing.`,
    });

    res
      .status(200)
      .json({ message: "Access granted and notification created" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to grant access and create notification",
      error: err.message,
    });
  }
};
