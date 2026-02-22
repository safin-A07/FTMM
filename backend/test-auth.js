require('dotenv').config();
const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const mongoose = require("mongoose");

const test = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected.");

        console.log("Initialing Better Auth...");
        const auth = betterAuth({
            database: mongodbAdapter(mongoose.connection.db),
            secret: process.env.JWT_SECRET || "test_secret",
            socialProviders: {
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                },
            },
            baseURL: "http://localhost:5000/api/auth",
        });
        console.log("Better Auth Initialized Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("BETTER AUTH INIT ERROR:", err);
        process.exit(1);
    }
};

test();
