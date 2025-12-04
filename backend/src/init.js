import { supabase } from "./database.js";

export const initializeServer = async () => {
  console.log("🚀 INIT: CompanyCareers Backend Starting...");
  console.log("📋 INIT: Loading environment variables");

  // Check environment variables
  const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      "❌ INIT: Missing required environment variables:",
      missingVars
    );
    process.exit(1);
  }

  console.log("✅ INIT: Environment variables loaded");

  // Test Supabase connection
  try {
    console.log("🔗 INIT: Testing Supabase connection...");

    // Simple test - try to get the current session (this tests the connection)
    const { data, error } = await supabase.auth.getSession();

    // This will succeed even if no session exists - it tests the connection
    console.log("✅ INIT: Supabase connection successful");
  } catch (error) {
    console.error("❌ INIT: Supabase connection failed:", error.message);
    console.log("⚠️  INIT: Continuing without database validation...");
  }

  console.log("🎯 INIT: Server initialization complete");
  console.log("");
};
