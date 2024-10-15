import dotenv from "dotenv";

dotenv.config();

dotenv.config();

const port = process.env.PORT || 3000;
const mongodbUri = process.env.MONGODB_URI || "";
const jwtSecret = process.env.JWT_SECRET || "";
const jwtExpiration = process.env.JWT_EXPIRATION || "1h";
const emailUser = process.env.EMAIL_USER || "";
const emailPassword = process.env.EMAIL_PASSWORD || "";
const environment = process.env.NODE_ENV || "development";
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorPayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const baseUrl = process.env.BASE_URL || "";
const instamojoApiKey = process.env.INSTAMOJO_API_KEY || "";
const instamojoAuthToken = process.env.INSTAMOJO_AUTH_TOKEN || "";

export const config = {
  port,
  mongodbUri,
  jwtSecret,
  jwtExpiration,
  emailUser,
  emailPassword,
  environment,
  razorpayKeyId,
  razorPayKeySecret,
  baseUrl,
  instamojoApiKey,
  instamojoAuthToken,
};
