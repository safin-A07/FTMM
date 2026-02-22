require('dotenv').config();
const mongoose = require('mongoose');

const test = async () => {
    try {
        console.log("Connecting (async)...");
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Success (async)!");
        process.exit(0);
    } catch (err) {
        console.error("Error (async):", err.message);
        process.exit(1);
    }
};

test();
