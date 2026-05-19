import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectMongo } from "./lib/mongoClient";
import { errorHandler } from "./middlewares/errorHandler";

import authRoutes from "./routes/auth.routes";
import productsRoutes from "./routes/products.routes";
import ordersRoutes from "./routes/orders.routes";
import usersRoutes from "./routes/users.routes";
import categoriesRoutes from "./routes/categories.routes";
import shippingRoutes from "./routes/shipping.routes";
import promotionsRoutes from "./routes/promotions.routes";
import reviewsRoutes from "./routes/reviews.routes";
import analyticsRoutes from "./routes/analytics.routes";
import notificationsRoutes from "./routes/notifications.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const ORIGIN = process.env.CORS_ORIGIN ?? "*";

app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada", code: "NOT_FOUND" }));
app.use(errorHandler);

async function start() {
  await connectMongo();
  app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("Fallo al iniciar el servidor:", err);
  process.exit(1);
});
