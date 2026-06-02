import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { logger } from "./logger";

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
  if (!uri) {
    logger.error("mongo: MONGODB_URI no definido");
    throw new Error("Missing MONGODB_URI env var");
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, tls: true });
    connected = true;
    logger.info("mongo: conectado");
  } catch (err) {
    logger.error("mongo: fallo de conexión", { message: (err as Error)?.message });
    throw err;
  }
  return mongoose;
}

export { mongoose };
