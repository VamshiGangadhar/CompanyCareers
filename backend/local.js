import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleEvent } from "./src/eventHandler.js";
import { initializeServer } from "./src/init.js";

// Load environment variables
dotenv.config();

// Initialize server
await initializeServer();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to clean payload for logging (remove sensitive data)
const cleanPayloadForLog = (payload) => {
  if (!payload || typeof payload !== "object") return payload;

  const cleaned = { ...payload };

  // Remove sensitive fields
  delete cleaned.token;
  delete cleaned.password;
  delete cleaned.confirmPassword;

  return cleaned;
};

// Main API endpoint - single event handler
app.post("/api/event", async (req, res) => {
  try {
    const { step, payload } = req.body;

    console.log(`\n🎯 Event Name: ${step}`);
    console.log(`📦 Payload:`, cleanPayloadForLog(payload));

    const result = await handleEvent(step, payload);
    console.log(`✅ Success: ${result.message || "Operation completed"}`);

    res.json(result);
  } catch (error) {
    console.error(`❌ Event Failed: ${req.body.step || "Unknown"}`);
    console.error(`💥 Error:`, error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message || "Internal server error",
        code: error.statusCode || 500,
      },
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "CompanyCareers Backend",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CompanyCareers Backend Ready`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/event`);
  console.log(`💓 Health: http://localhost:${PORT}/health`);
  console.log(`\n⭐ Waiting for API calls...\n`);
});
