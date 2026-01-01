import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ======================
   OpenAI Client
====================== */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ======================
   Health Check
====================== */
app.get("/", (req, res) => {
  res.send("✅ Shiko Lingo Backend is running");
});

/* ======================================================
   Pi Network – Payments (CHECKLIST / TESTNET)
====================================================== */

/**
 * ✅ IMPORTANT
 * Testnet base URL (Checklist)
 */
const PI_API_BASE = "https://api-testnet.minepi.com";

function piHeaders() {
  return {
    Authorization: `Key ${process.env.PI_API_KEY}`,
    "Content-Type": "application/json",
  };
}

/* ===== Approve Payment ===== */
app.post("/api/pi/approve", async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({
      error: "PAYMENT_ID_REQUIRED",
    });
  }

  try {
    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: piHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ PI APPROVE FAILED:", data);
      return res.status(response.status).json({
        error: "PI_APPROVE_FAILED",
        details: data,
      });
    }

    console.log("✅ PI APPROVED:", paymentId);

    return res.status(200).json({
      status: "APPROVED",
      paymentId,
    });
  } catch (err) {
    console.error("❌ PI APPROVE ERROR:", err);
    return res.status(500).json({
      error: "PI_APPROVE_EXCEPTION",
    });
  }
});

/* ===== Complete Payment ===== */
app.post("/api/pi/complete", async (req, res) => {
  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({
      error: "PAYMENT_ID_AND_TXID_REQUIRED",
    });
  }

  try {
    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: piHeaders(),
        body: JSON.stringify({ txid }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ PI COMPLETE FAILED:", data);
      return res.status(response.status).json({
        error: "PI_COMPLETE_FAILED",
        details: data,
      });
    }

    console.log("✅ PI COMPLETED:", paymentId, txid);

    return res.status(200).json({
      status: "COMPLETED",
      paymentId,
      txid,
    });
  } catch (err) {
    console.error("❌ PI COMPLETE ERROR:", err);
    return res.status(500).json({
      error: "PI_COMPLETE_EXCEPTION",
    });
  }
});

/* ======================
   Start Server (LOCAL ONLY)
====================== */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
