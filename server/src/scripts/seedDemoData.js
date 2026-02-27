import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Review from "../models/Review.js";
import Report from "../models/Report.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import connectDB from "../db/connectDB.js";

dotenv.config();

const demoUsers = [
  {
    name: "Erik Vroom",
    email: "erik@bicyclel.nl",
    password: "Password123!",
    city: "Amsterdam",
    country: "Netherlands",
    bio: "Passionate road cyclist and certified mechanic. Selling some of my collection to make room for new projects.",
    avatarUrl: "https://i.pravatar.cc/300?u=erik",
    isVerified: true,
    role: "user",
  },
  {
    name: "Saki Tanaka",
    email: "saki@bicyclel.nl",
    password: "Password123!",
    city: "Tokyo",
    country: "Japan",
    bio: "Tech enthusiast and urban commuter. I love high-end E-bikes and portable folding bikes.",
    avatarUrl: "https://i.pravatar.cc/300?u=saki",
    isVerified: true,
    role: "user",
  },
  {
    name: "John Wheeler",
    email: "john@bicyclel.nl",
    password: "Password123!",
    city: "New York",
    country: "USA",
    bio: "Mountain bike trail explorer. Upgrading my gear regularly.",
    avatarUrl: "https://i.pravatar.cc/300?u=john",
    isVerified: true,
    role: "user",
  },
  {
    name: "BiCycleL Admin",
    email: "admin@bicyclel.nl",
    password: "AdminPassword123!",
    city: "Amsterdam",
    country: "Netherlands",
    bio: "Chief platform administrator.",
    avatarUrl: "https://i.pravatar.cc/300?u=admin",
    isVerified: true,
    role: "admin",
  },
];

const demoListings = [
  {
    title: "Specialized S-Works Tarmac SL7",
    description:
      "Mint condition, aero performance machine. Full Shimano Dura-Ace Di2 12-speed groupset.",
    price: 8500,
    location: "Amsterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.8952, 52.3702] },
    brand: "Specialized",
    model: "S-Works Tarmac SL7",
    year: 2023,
    category: "Road",
    condition: "like-new",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Erik Vroom",
  },
  {
    title: "VanMoof S5 - Dark Edition",
    description:
      "The latest E-bike technology from Amsterdam. Revolutionary halo ring interface.",
    price: 2400,
    location: "Tokyo, Japan",
    coordinates: { type: "Point", coordinates: [139.6917, 35.6895] },
    brand: "VanMoof",
    model: "S5",
    year: 2023,
    category: "E-bike",
    condition: "new",
    status: "sold",
    images: [
      "https://images.unsplash.com/photo-1593761781203-f142999e8293?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Saki Tanaka",
  },
  {
    title: "Santa Cruz Nomad CC",
    description: "The ultimate enduro weapon. VPP suspension, carbon frame.",
    price: 4800,
    location: "New York, USA",
    coordinates: { type: "Point", coordinates: [-74.006, 40.7128] },
    brand: "Santa Cruz",
    model: "Nomad CC",
    year: 2021,
    category: "Mountain",
    condition: "good",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "John Wheeler",
  },
];

const seedDemoData = async () => {
  try {
    await connectDB();
    /* eslint-disable no-console */
    console.log("Starting full demo seed...");

    // 1. CLEAR COLLECTIONS
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Review.deleteMany({});
    await Report.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log("Database cleared.");

    // 2. CREATE USERS
    const createdUsers = [];
    for (const u of demoUsers) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const user = await User.create({ ...u, password: hashedPassword });
      createdUsers.push(user);
    }
    const erik = createdUsers.find((u) => u.name === "Erik Vroom");
    const saki = createdUsers.find((u) => u.name === "Saki Tanaka");
    const john = createdUsers.find((u) => u.name === "John Wheeler");
    console.log("Users created.");

    // 3. CREATE LISTINGS
    const createdListings = [];
    for (const l of demoListings) {
      const owner = createdUsers.find((u) => u.name === l.userName);
      const { userName: _unused, ...lData } = l;
      const listing = await Listing.create({ ...lData, ownerId: owner._id });
      createdListings.push(listing);
    }
    const tarmac = createdListings.find((l) => l.title.includes("Tarmac"));
    const vanmoof = createdListings.find((l) => l.title.includes("VanMoof"));
    console.log("Listings created.");

    // 4. CREATE MESSAGES (A real conversation)
    const room = [erik._id, saki._id].sort().join("_");
    await Message.create([
      {
        senderId: saki._id,
        receiverId: erik._id,
        listingId: tarmac._id,
        content: "Hi Erik, is the Tarmac still available?",
        room,
      },
      {
        senderId: erik._id,
        receiverId: saki._id,
        listingId: tarmac._id,
        content:
          "Yes Saki! It's in perfect condition. Would you like to see more photos?",
        room,
      },
      {
        senderId: saki._id,
        receiverId: erik._id,
        listingId: tarmac._id,
        content: "Yes please, specifically the drivetrain.",
        room,
      },
    ]);
    console.log("Conversation created.");

    // 5. CREATE REVIEW (For the sold VanMoof)
    await Review.create({
      reviewerId: erik._id,
      targetId: saki._id,
      listingId: vanmoof._id,
      rating: 5,
      comment:
        "Smooth transaction! Saki is a great seller and the VanMoof is even better than described.",
    });
    // Update user rating stats
    saki.ratingSum = 5;
    saki.reviewCount = 1;
    await saki.save();
    console.log("Review created and user stats updated.");

    // 6. CREATE REPORTS (For Admin Demo)
    await Report.create([
      {
        reporterId: john._id,
        targetId: tarmac._id,
        targetType: "Listing",
        reason: "Suspected fake listing, price is too low for this model.",
        status: "pending",
      },
      {
        reporterId: saki._id,
        targetId: john._id,
        targetType: "User",
        reason: "User was aggressive in messages.",
        status: "pending",
      },
    ]);
    console.log("Reports created.");

    // 7. CREATE NOTIFICATIONS
    await Notification.create([
      {
        recipientId: erik._id,
        senderId: saki._id,
        type: "message",
        title: "New Message",
        body: "Saki sent you a message about your Tarmac",
        link: `/inbox/${room}`,
        read: false,
      },
      {
        recipientId: saki._id,
        senderId: erik._id,
        type: "favorite",
        title: "New Favorite",
        body: "Erik favorited your VanMoof",
        link: `/listing/${vanmoof._id}`,
        read: false,
      },
      {
        recipientId: saki._id,
        senderId: erik._id,
        type: "review",
        title: "New Review",
        body: "Erik left you a 5-star review!",
        link: `/profile/${saki._id}/reviews`,
        read: false,
      },
    ]);
    console.log("Notifications created.");

    console.log("FULL DEMO SEED COMPLETED!");
    /* eslint-enable no-console */
    process.exit(0);
  } catch (error) {
    /* eslint-disable no-console */
    console.error("Error during seed:", error);
    process.exit(1);
  }
};

seedDemoData();
