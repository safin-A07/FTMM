require('dotenv').config();
const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const mongoose = require("mongoose");

const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection.db),
    secret: process.env.JWT_SECRET || "fallback_secret_for_dev_only",
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    baseURL: (process.env.BETTER_AUTH_URL || "http://localhost:5173") + "/api/auth",
});

module.exports = { auth };
