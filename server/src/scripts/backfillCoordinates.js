/* eslint-disable no-console */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "../models/Listing.js";
import { geocodeLocation } from "../utils/geocoder.js";

dotenv.config();

const backfillCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    // Find listings missing coordinates
    const listings = await Listing.find({ coordinates: { $exists: false } });
    console.log(`Found ${listings.length} listings missing coordinates.`);

    let successCount = 0;
    let failCount = 0;

    for (const listing of listings) {
      if (!listing.location) continue;

      console.log(
        `Geocoding location: ${listing.location} for listing ${listing._id}`,
      );

      const coords = await geocodeLocation(listing.location);

      if (coords) {
        listing.coordinates = coords;
        await listing.save();
        successCount++;
        console.log(`✅ Success for ${listing.location}`);
      } else {
        failCount++;
        console.log(`❌ Failed for ${listing.location}`);
      }

      // Nominatim requires max 1 request per second to avoid getting blocked
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    console.log(
      `\nBackfill complete. Success: ${successCount}, Failed: ${failCount}`,
    );
  } catch (error) {
    console.error("Error during backfill:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

backfillCoordinates();
