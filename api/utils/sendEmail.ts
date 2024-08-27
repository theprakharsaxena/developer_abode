import nodemailer from "nodemailer";
import { config } from "../config/config";

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
