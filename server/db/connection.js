import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDB() {
  try {
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set. Add it to .env.local for local backend runs or to Render environment variables for production.");
    }
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}
