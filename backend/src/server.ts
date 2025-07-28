import dotenv from "dotenv";
import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "@/routes/authRoutes";
import userRoutes from "@/routes/userRoutes";
import miscRoutes from "@/routes/miscRoutes";
import lessonRoutes from "@/routes/lessonRoutes";
import { errorHandler, notFoundHandler } from "@middleware/errorHandler";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/misc", miscRoutes);
app.use("/api/lessons", lessonRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const MONGO_URI = process.env.MONGO_URI!;
const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

process.on("unhandledRejection", (reason: Error) => {
  console.error("Unhandled Rejection:", reason.message);
  console.error("Stack:", reason.stack);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.info("SIGTERM received");
  process.exit(0);
});

export default app;
