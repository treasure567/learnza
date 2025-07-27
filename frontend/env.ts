const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  API_KEY: process.env.NEXT_PUBLIC_API_KEY || "",
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  ENABLE_GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true",
  ENABLE_EMAIL_VERIFICATION:
    process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION === "true",
} as const;

// Validate environment variables
const requiredEnvVars = ["API_URL", "API_KEY"] as const;

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default env;
