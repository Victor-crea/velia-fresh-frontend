import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let connected = false;

/**
 * Conecta a MongoDB Atlas (singleton).
 * Llamar una vez al arranque del servidor.
 */
export async function connectMongo(): Promise<typeof mongoose> {
  if (connected) return mongoose;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI env var");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  connected = true;
  console.log("✅ MongoDB conectado");
  return mongoose;
}

export { mongoose };
