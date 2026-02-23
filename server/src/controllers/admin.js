import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import { logError } from "../util/logging.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const featuredListings = await Listing.countDocuments({ isFeatured: true });

    // Get metrics over the last 7 days for the graph
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentListings = await Listing.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const pendingReports = await Report.countDocuments({ status: "pending" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        featuredListings,
        pendingReports,
        recentListings,
      },
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to retrieve stats" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -verificationCode -securityCode")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to retrieve users" });
  }
};

export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Prevent removing your own admin rights accidentally
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, msg: "Cannot change your own role" });
    }

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to change user role" });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Prevent blocking yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, msg: "Cannot block yourself" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to toggle block status" });
  }
};

export const toggleUserVerify = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to toggle verify status" });
  }
};

export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, listings });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to retrieve listings" });
  }
};

export const toggleListingFeatured = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    listing.isFeatured = !listing.isFeatured;
    await listing.save();

    res.status(200).json({ success: true, listing });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to toggle featured status" });
  }
};

export const deleteListingByAdmin = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, msg: "Listing deleted successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to delete listing" });
  }
};
