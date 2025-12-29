import express from "express";
import cors from "cors";
import connectDB from "./server/db/connect.js";
import adminRoutes from "./server/routes/adminRoutes.js";
import paymentsRoutes from "./server/routes/paymentsRoutes.js";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/admin", adminRoutes);
app.use("/", paymentsRoutes);

const start = async () => {
  await connectDB();
  app.listen(5000, () => console.log("🚀 Backend Running on port 5000"));
};

start();
