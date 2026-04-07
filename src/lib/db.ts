import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const cached: MongooseCache = (global as Record<string, unknown>)
  .mongoose as MongooseCache || { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set — skipping database connection");
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  (global as Record<string, unknown>).mongoose = cached;
  return cached.conn;
}
