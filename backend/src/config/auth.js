require("dotenv").config();
const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const mongoose = require("mongoose");

const trimTrailingSlash = (url = "") => url.replace(/\/+$/, "");

// Prefer same-origin auth URL through frontend/proxy when CLIENT_URL is present.
// Fallback to BETTER_AUTH_URL for direct backend-hosted auth routes.
const authOrigin = trimTrailingSlash(
  process.env.BETTER_AUTH_URL ||
    process.env.AUTH_ORIGIN ||
    process.env.CLIENT_URL ||
    "http://localhost:5000",
);

const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.db),
  secret: process.env.JWT_SECRET || "fallback_secret_for_dev_only",
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:5173"],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  baseURL: authOrigin + "/api/auth",
});

module.exports = { auth };
