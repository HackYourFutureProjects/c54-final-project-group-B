import express from "express";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listing.js";
import {
  authenticate,
  requireVerified,
  requireOwnership,
} from "../middleware/auth.js";
import Listing from "../models/Listing.js";

const listingRouter = express.Router();

// GET /api/listings - Get all listings
listingRouter.get("/", getListings);

// GET /api/listings/:id - Get single listing
listingRouter.get("/:id", getListingById);

// POST /api/listings - Create a new listing (requires authentication & verification)
listingRouter.post("/", authenticate, requireVerified, createListing);

// PUT /api/listings/:id - Update listing (requires authentication & ownership)
listingRouter.put(
  "/:id",
  authenticate,
  requireOwnership(Listing),
  updateListing,
);

// DELETE /api/listings/:id - Delete listing (requires authentication & ownership)
listingRouter.delete(
  "/:id",
  authenticate,
  requireOwnership(Listing),
  deleteListing,
);

export default listingRouter;
