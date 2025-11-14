const cron = require("node-cron");
const axios = require("axios");

console.log("⏰ Local cron started...");

// Run every 1 minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("▶️ Cron Triggered: calling /api/cron-test...");
    const response = await axios.get(
      "https://h3x5x9xw-3000.inc1.devtunnels.ms/api/cron-test"
    );
    console.log("✅ API response:", response.data);
  } catch (error) {
    console.error("❌ Error triggering API:", error.message);
  }
});

console.log("✅ Local cron scheduler running every 1 minute...");
