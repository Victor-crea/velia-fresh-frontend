import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

dns.setServers(['8.8.8.8']);

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
    tls: true,
  });
  connected = true;
  console.log("✅ MongoDB conectado");
  return mongoose;
}

export { mongoose };