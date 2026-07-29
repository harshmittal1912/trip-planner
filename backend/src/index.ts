import "dotenv/config"; // must be the FIRST import so env vars are ready before any other module (like llmService.ts) reads them

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
