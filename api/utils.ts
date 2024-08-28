import mongoose from "mongoose";
import { config } from "./config";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiration,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can use other services or SMTP settings
    secure: true,
    port: 465,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });

  const mailOptions = {
    from: config.emailUser,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
