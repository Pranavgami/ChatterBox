import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

function requireFromEnv(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing environment variable: ${key}`);
    return process.exit(1);
  }
  return value;
}

function optionalFromEnv(key, defaultValue) {
  if (process.env[key]) {
    return process.env[key];
  } else {
    return defaultValue;
  }
}

const env = {
  PORT: parseInt(requireFromEnv("PORT")),
  MONGODB_URL: requireFromEnv("MONGODB_URL"),
  JWT_SECRET: requireFromEnv("JWT_SECRET"),
  JWT_ACCESS_TOKEN_EXPIRES_IN: requireFromEnv("JWT_ACCESS_TOKEN_EXPIRES_IN"),
  CLOUDINARY_CLOUD_NAME: requireFromEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: requireFromEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: requireFromEnv("CLOUDINARY_API_SECRET"),
};

export default env;
