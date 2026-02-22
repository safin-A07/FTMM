require('dotenv').config();
const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");

console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING");

try {
    const auth = betterAuth({
        database: {
            db: { collection: () => ({}) } // Mock DB for init test
        },
        secret: process.env.JWT_SECRET || "fallback",
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
        },
        baseURL: (process.env.BETTER_AUTH_URL || "http://localhost:5000") + "/api/auth",
    });
    console.log("✅ Better Auth initialized successfully in test script");
} catch (err) {
    console.error("❌ Better Auth init FAILED:");
    console.error(err);
}
