import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./server/models/Admin.js";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Connected to MongoDB");

    const username = "shiko";   // ← غيّر ده لو حابب
    const password = "admin123"; // ← غيّر ده فورًا بعد أول دخول

    const hashed = await bcrypt.hash(password, 10);

    await Admin.create({
      username,
      password: hashed
    });

    console.log("✅ Admin created successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
