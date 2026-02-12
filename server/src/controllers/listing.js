import mongoose from "mongoose";

import Listing, { validateListing } from "../models/Listing.js";
import { logError } from "../util/logging.js";
import validationErrorMessage from "../util/validationErrorMessage.js";

// Helper to escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to check if value is a plain object (not null, not array)
const isPlainObject = (val) =>
  val != null && typeof val === "object" && !Array.isArray(val);

// GET all listings
export const getListings = async (req, res) => {
  try {
    const { status, location } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (location)
      filter.location = { $regex: escapeRegex(location), $options: "i" };

    const listings = await Listing.find(filter).populate(
      "ownerId",
      "name email",
    );
    res.status(200).json({ success: true, result: listings });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to get listings, try again later" });
  }
};

// GET single listing by ID
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid listing ID" });
    }

    const listing = await Listing.findById(id).populate(
      "ownerId",
      "name email",
    );

    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    res.status(200).json({ success: true, result: listing });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to get listing, try again later" });
  }
};

// Whitelist of fields allowed in requests (excluding ownerId which is auto-assigned)
const ALLOWED_FIELDS = [
  "title",
  "description",
  "price",
  "location",
  "type",
  "leaseDuration",
  "brand",
  "model",
  "year",
  "condition",
  "mileage",
  "images",
];

// Helper to filter object to only allowed fields
const filterFields = (obj) => {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (ALLOWED_FIELDS.includes(key)) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

// POST create new listing
export const createListing = async (req, res) => {
  try {
    const listingData = req.body?.listing;

    if (!isPlainObject(listingData)) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide a 'listing' object.",
      });
    }

    // Filter fields to prevent mass assignment of sensitive fields like ownerId
    const cleanListing = filterFields(listingData);

    // Auto-assign ownerId from authenticated user
    // req.user is guaranteed by authenticate middleware
    cleanListing.ownerId = req.user._id;

    // Validate using the model's validation logic (which checks required fields)
    const errorList = validateListing(cleanListing);

    if (errorList.length > 0) {
      return res
        .status(400)
        .json({ success: false, msg: validationErrorMessage(errorList) });
    }

    const newListing = await Listing.create(cleanListing);
    res.status(201).json({ success: true, listing: newListing });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to create listing, try again later",
    });
  }
};

// PUT update listing
export const updateListing = async (req, res) => {
  try {
    const updates = req.body?.listing;

    // req.resource is attached by requireOwnership middleware
    const { id } = req.params;

    if (!isPlainObject(updates)) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide a 'listing' object with updates.",
      });
    }

    // Filter updates
    const cleanUpdates = filterFields(updates);

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: cleanUpdates },
      {
        new: true,
        runValidators: true, // Force validation on update
      },
    );

    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    res.status(200).json({ success: true, listing });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to update listing, try again later",
    });
  }
};

// DELETE listing
export const deleteListing = async (req, res) => {
  try {
    // req.resource is attached by requireOwnership middleware
    const { id } = req.params;

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      return res.status(404).json({ success: false, msg: "Listing not found" });
    }

    res
      .status(200)
      .json({ success: true, msg: "Listing deleted successfully" });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to delete listing, try again later",
    });
  }
};
