import "dotenv/config";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import crypto from "crypto";

async function run() {
  await connectDB();

  const adminEmail = "admin@seam.test";
  const admin = await User.findOne({ email: adminEmail });
  
  if (!admin) {
    console.log("Admin user not found.");
    process.exit(1);
  }

  // Generate a random secure password
  const newPassword = crypto.randomBytes(10).toString("hex");
  await admin.setPassword(newPassword);
  await admin.save();

  console.log(`\n======================================================`);
  console.log(`SUCCESS: Admin password has been updated securely.`);
  console.log(`Email: ${adminEmail}`);
  console.log(`New Password: ${newPassword}`);
  console.log(`Please save this password in a secure location.`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Failed to change password:", err);
  process.exit(1);
});
