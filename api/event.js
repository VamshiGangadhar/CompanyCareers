import { handleEvent } from "../../backend/src/eventHandler.js";
import { initializeServer } from "../../backend/src/init.js";

// Initialize server once
let isInitialized = false;

const initOnce = async () => {
  if (!isInitialized) {
    await initializeServer();
    isInitialized = true;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Initialize server if needed
    await initOnce();

    // Helper to clean payload for logging (remove sensitive data)
    function cleanPayloadForLogging(payload) {
      const cleaned = { ...payload };
      if (cleaned.data?.password) {
        cleaned.data.password = "***";
      }
      if (cleaned.data?.confirmPassword) {
        cleaned.data.confirmPassword = "***";
      }
      return cleaned;
    }

    const payload = {
      method: req.method,
      url: req.url || '/',
      headers: req.headers,
      query: req.query,
      data: req.body,
    };

    console.log(`📝 Incoming ${req.method} ${req.url}:`, cleanPayloadForLogging(payload));

    const result = await handleEvent(payload);
    
    console.log(`✅ Response for ${req.method} ${req.url}:`, {
      success: result.success,
      statusCode: result.statusCode,
      hasData: !!result.data
    });

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error(`❌ Error in ${req.method} ${req.url}:`, error.message);
    
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        message: error.message || "Internal server error",
        code: error.statusCode || 500,
      },
    });
  }
}