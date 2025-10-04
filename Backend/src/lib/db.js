import mongoose from "mongoose";
import env from "../utils.js/env.js";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });
    await mongoose.connect(env.MONGODB_URL);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
