const mongoose = require("mongoose");
const User = require("./models/userModel");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

const testLogin = async () => {
    await connectDB();

    console.log("Fetching users...");
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`Testing user: ${user.email}`);
        console.log(`ID: ${user._id}`);

        try {
            console.log("Attempting matchPassword...");
            const isMatch = await user.matchPassword("123456");
            console.log(`Match result for ${user.email}:`, isMatch);

            console.log("Attempting generateToken...");
            const token = generateToken(user._id);
            console.log("Token generated:", token ? "YES" : "NO");

        } catch (error) {
            console.error(`CRASHED for user ${user.email}:`, error);
        }

        try {
            console.log("Attempting matchPassword with UNDEFINED...");
            const isMatch = await user.matchPassword(undefined);
            console.log(`Match result for UNDEFINED:`, isMatch);
        } catch (error) {
            console.error(`CRASHED for UNDEFINED password:`, error);
        }

        console.log("------------------------------------------------");
    }

    process.exit();
};

testLogin();
