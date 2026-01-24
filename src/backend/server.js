import express from "express";
import cors from "cors";
import connectDB from "./server/db/connect.js";
import adminRoutes from "./server/routes/adminRoutes.js";
import paymentsRoutes from "./server/routes/paymentsRoutes.js";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/**
 * =========================
 * CORS CONFIG (IMPORTANT)
 * =========================
 */
const allowedOrigins = [
  "https://shikolingo.site",
  "https://shiko-lingo-app.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server, curl, Vercel internal calls
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/**
 * =========================
 * MIDDLEWARES
 * =========================
 */
app.use(express.json());
app.use(morgan("dev"));

/**
 * =========================
 * ROUTES
 * =========================
 */
app.use("/admin", adminRoutes);
app.use("/", paymentsRoutes);
// ⚠️ لو عندك AI Tutor routes في ملف منفصل:
// import aiTutorRoutes from "./server/routes/aiTutorRoutes.js";
// app.use("/api/ai", aiTutorRoutes);

/**
 * =========================
 * SERVER START
 * =========================
 */
const start = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Backend running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

start();