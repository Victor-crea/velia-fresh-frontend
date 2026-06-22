import fs from "fs";
import path from "path";
import winston from "winston";
import "winston-daily-rotate-file";

const LOG_DIR = process.env.LOG_DIR ?? "logs";
if (!fs.existsSync(LOG_DIR)) {
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch { /* ignore */ }
}

const { combine, timestamp, errors, splat, json, colorize, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} [${level}] ${message}${rest}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(timestamp(), errors({ stack: true }), splat(), json()),
  defaultMeta: { service: "evelia-backend" },
  transports: [
    // Consola — igual que antes
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), consoleFormat),
    }),

    // ← Solo cambia esto: File → DailyRotateFile
    new winston.transports.DailyRotateFile({
      filename: path.join(LOG_DIR, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "5m",
      maxFiles: "14d",
      zippedArchive: false,   // Promtail no lee .gz
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(LOG_DIR, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "5m",
      maxFiles: "14d",
      zippedArchive: false,
    }),
  ],
});

export const morganStream = {
  write: (message: string) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};