// seedAdmin.js
const mongoose = require("mongoose");
const User = require("./models/User"); // Adjust path if needed
require("dotenv").config();

const run = async () => {
    mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartxerox")

    const exists = await User.findOne({ email: "admin@smartxerox.com" });
    if (exists) {
        console.log("Admin already exists:", exists.email);
        return mongoose.disconnect();
    }

    const admin = new User({
        username: "admin",
        email: "admin@smartxerox.com",
        password: "admin123", // This will be hashed automatically
        is_admin: true,
        is_customer: false
    });

    await admin.save(); // ✅ Triggers pre-save hook for password hashing
    console.log("✅ Admin created");

    mongoose.disconnect();
};

run().catch((err) => {
    console.error("❌ Error:", err.message);
    mongoose.disconnect();
});
