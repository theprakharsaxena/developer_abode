import dotenv from "dotenv";

dotenv.config();

export const config = {
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiration: process.env.JWT_EXPIRATION || "1h",
  emailUser: process.env.EMAIL_USER || "",
  emailPassword: process.env.EMAIL_PASSWORD || "",
};
