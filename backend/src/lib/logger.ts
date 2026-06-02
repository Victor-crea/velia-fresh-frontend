import fs from "fs";
import path from "path";
import winston from "winston";

const LOG_DIR = process.env.LOG_DIR ?? "logs";
if (!fs.existsSync(LOG_DIR)) {
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch { /* ignore */ }
}

const { combine, timestamp, errors, splat, json, colorize, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} [${level}] ${message}${rest}`;
});

/**
 * Logger central de la aplicación. Escribe a consola y a archivos rotados
 * por nivel: logs/combined.log y logs/error.log.
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(timestamp(), errors({ stack: true }), splat(), json()),
  defaultMeta: { service: "evelia-backend" },
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), consoleFormat),
    }),
    new winston.transports.File({ filename: path.join(LOG_DIR, "error.log"), level: "error", maxsize: 5 * 1024 * 1024, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(LOG_DIR, "combined.log"), maxsize: 5 * 1024 * 1024, maxFiles: 5 }),
  ],
});

/** Stream para conectar morgan -> winston */
export const morganStream = {
  write: (message: string) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};
