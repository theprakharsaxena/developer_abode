import dotenv from "dotenv";

dotenv.config();

dotenv.config();

const port = process.env.PORT || 3000;
const mongodbUri = process.env.MONGODB_URI || "";
const jwtSecret = process.env.JWT_SECRET || "";
const jwtExpiration = process.env.JWT_EXPIRATION || "1h";
const emailUser = process.env.EMAIL_USER || "";
const emailPassword = process.env.EMAIL_PASSWORD || "";

export const config = {
  port,
  mongodbUri,
  jwtSecret,
  jwtExpiration,
  emailUser,
  emailPassword,
};
