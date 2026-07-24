const dotenv = require("dotenv");
const path = require("path");

// In production (Render) there is no .env file — env vars are set in the dashboard.
// dotenv.config() silently ignores a missing file in v16, but v17 (dotenvx) may throw.
// Wrap it so a missing file never crashes the process.
try {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
} catch {
  // .env not present — that's fine in production
}

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if(missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUrl: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRY_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'arr_token',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173, http://localhost:5174')
    .split(',')
    .map((O) => O.trim())
    .filter(Boolean),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  isProd: process.env.NODE_ENV === "production",
};
