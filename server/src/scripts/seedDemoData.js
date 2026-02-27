import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import connectDB from "../db/connectDB.js";

dotenv.config();

const users = [
  {
    name: "Erik Vroom",
    email: "erik@bicyclel.nl",
    password: "Password123!",
    city: "Amsterdam",
    country: "Netherlands",
    bio: "Passionate road cyclist and certified mechanic. Selling some of my collection to make room for new projects.",
    avatarUrl: "https://i.pravatar.cc/300?u=erik",
    isVerified: true,
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
  },
  {
    name: "Clara Dupont",
    email: "clara@bicyclel.nl",
    password: "Password123!",
    city: "Paris",
    country: "France",
    bio: "Vintage bike collector and restoration artist. Specializing in classic European road bikes.",
    avatarUrl: "https://i.pravatar.cc/300?u=clara",
    isVerified: true,
  },
];

const listingsData = [
  {
    title: "Specialized S-Works Tarmac SL7",
    description:
      "Mint condition, aero performance machine. Full Shimano Dura-Ace Di2 12-speed groupset. Internal cable routing and Roval Rapide CLX wheels.",
    price: 8500,
    location: "Amsterdam, Netherlands",
    coordinates: { type: "Point", coordinates: [4.8952, 52.3702] },
    brand: "Specialized",
    model: "S-Works Tarmac SL7",
    year: 2023,
    category: "Road",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532124958905-df1fd300a20b?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Erik Vroom",
  },
  {
    title: "Canyon Grizl CF SL 8",
    description:
      "Ultimate gravel adventure bike. Features Shimano GRX 810 groupset and DT Swiss gravel wheels. Perfect for multi-day bikepacking trips.",
    price: 3200,
    location: "Utrecht, Netherlands",
    coordinates: { type: "Point", coordinates: [5.1214, 52.0907] },
    brand: "Canyon",
    model: "Grizl CF SL 8",
    year: 2022,
    category: "Gravel",
    condition: "good",
    images: [
      "https://images.unsplash.com/photo-1571068316341-21bc1428a294?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Erik Vroom",
  },
  {
    title: "VanMoof S5 - Dark Edition",
    description:
      "The latest E-bike technology from Amsterdam. Features the revolutionary halo ring interface and automatic shifting. Extremely low mileage.",
    price: 2400,
    location: "Tokyo, Japan",
    coordinates: { type: "Point", coordinates: [139.6917, 35.6895] },
    brand: "VanMoof",
    model: "S5",
    year: 2023,
    category: "E-bike",
    condition: "new",
    images: [
      "https://images.unsplash.com/photo-1593761781203-f142999e8293?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Saki Tanaka",
  },
  {
    title: "Brompton C Line Explore",
    description:
      "Classic folding bike updated for the modern city. 6-speed gears and premium British craftsmanship. Fits easily under a desk or in a train.",
    price: 1650,
    location: "Ginza, Tokyo",
    coordinates: { type: "Point", coordinates: [139.767, 35.672] },
    brand: "Brompton",
    model: "C Line Explore",
    year: 2022,
    category: "City",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Saki Tanaka",
  },
  {
    title: "Santa Cruz Nomad CC",
    description:
      "The ultimate enduro weapon. VPP suspension, carbon frame, and FOX Factory suspension. Built to take on the most technical descents.",
    price: 4800,
    location: "New York, USA",
    coordinates: { type: "Point", coordinates: [-74.006, 40.7128] },
    brand: "Santa Cruz",
    model: "Nomad CC",
    year: 2021,
    category: "Mountain",
    condition: "good",
    images: [
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "John Wheeler",
  },
  {
    title: "Bianchi Specialissima Pantani Edition",
    description:
      "A piece of cycling history. Ultra-light carbon frame in the iconic Mercatone Uno colors. Fully restored with period-correct components.",
    price: 7200,
    location: "Paris, France",
    coordinates: { type: "Point", coordinates: [2.3522, 48.8566] },
    brand: "Bianchi",
    model: "Specialissima",
    year: 2020,
    category: "Road",
    condition: "like-new",
    images: [
      "https://images.unsplash.com/photo-1532124958905-df1fd300a20b?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Clara Dupont",
  },
  {
    title: "Peugeot PX10 Vintage Road",
    description:
      "Original 1970s frame with a beautiful patina. Reynolds 531 tubing and Simplex derailleurs. A true classic for the vintage enthusiast.",
    price: 950,
    location: "Le Marais, Paris",
    coordinates: { type: "Point", coordinates: [2.359, 48.857] },
    brand: "Peugeot",
    model: "PX10",
    year: 1975,
    category: "Road",
    condition: "fair",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop",
    ],
    userName: "Clara Dupont",
  },
];

const seedDemoData = async () => {
  try {
    await connectDB();
    /* eslint-disable no-console */
    console.log("Connected to database for demo seeding...");

    // 1. Clear existing data
    console.log("Cleaning up existing owners and listings...");
    await User.deleteMany({ email: { $in: users.map((u) => u.email) } });
    await Listing.deleteMany({
      title: { $in: listingsData.map((l) => l.title) },
    });

    // 2. Create Users
    console.log("Seeding demo users...");
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users created.`);

    // 3. Create Listings
    console.log("Seeding demo listings...");
    let listingsCount = 0;
    for (const listingData of listingsData) {
      const owner = createdUsers.find((u) => u.name === listingData.userName);
      if (!owner) continue;

      const { userName, ...lData } = listingData;
      // Use userName indirectly via ownerId as required by schema
      console.log(`Creating listing for ${userName}...`);
      const listing = new Listing({
        ...lData,
        ownerId: owner._id,
        status: "active",
        views: Math.floor(Math.random() * 500) + 100,
        inquiries: Math.floor(Math.random() * 20),
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000,
        ),
      });
      await listing.save();
      listingsCount++;
    }
    console.log(`${listingsCount} listings created.`);

    console.log("Demo seeding completed successfully!");
    /* eslint-enable no-console */
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error seeding demo data:", error);
    process.exit(1);
  }
};

seedDemoData();
