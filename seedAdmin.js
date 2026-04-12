require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for Seeding...");

    const hashedPassword = await bcrypt.hash("warden@2026", 10);

    const adminUser = new User({
      name: "Chief Warden",
      email: "warden@hinduhostel.com",
      password: hashedPassword,
      adminId: "HH-WARDEN-01",
      role: "admin",
      designation: "Chief Warden",
      isVerified: true,
    });

    await User.deleteMany({ role: "admin" });
    await adminUser.save();

    console.log("-----------------------------------------");
    console.log("✅ SUCCESS: Admin User Created!");
    console.log("Email: warden@hinduhostel.com");
    console.log("Password: warden@2026");
    console.log("-----------------------------------------");

    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Seeding Error:", err);
  });
