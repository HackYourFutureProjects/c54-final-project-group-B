// server/controllers/notifications.js
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import Listing from "../models/Listing.js";

// 3 - شخص قام بمراجعتك
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
      message: `${req.user.name} قام بمراجعتك!`,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الريفيو" });
  }
};

// 4 - شخص أعطاك حق الوصول
export const giveAccessAndNotify = async (req, res) => {
  try {
    const { listingId, targetUserId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ message: "القائمة غير موجودة" });

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
      message: `${req.user.name} منحك حق الوصول لمراجعة هذه القائمة.`,
    });

    res.status(200).json({ message: "تم منح حق الوصول والإشعار تم إنشاؤه" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء منح حق الوصول" });
  }
};
