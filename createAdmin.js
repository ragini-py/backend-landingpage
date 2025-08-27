const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("./models/admin"); // adjust path if needed

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const hashedPassword = await bcrypt.hash("yourStrongPassword", 10);

        const admin = new Admin({
            email: "admin@example.com",
            password: hashedPassword,
            role: "superadmin"
        });


        await admin.save();
        console.log("✅ Admin created:", admin.email);

        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error creating admin:", err);
        mongoose.connection.close();
    }
}

createAdmin();
