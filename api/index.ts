import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { config } from "./config";
import express, { Router } from "express";
import helmet from "helmet";
import {
  verifyUser,
  forgotPassword,
  getUser,
  loginUser,
  registerUser,
  resetPassword,
} from "./controllers/user.controller";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  createInternship,
  deleteInternship,
  getInternshipById,
  getInternships,
  updateInternship,
} from "./controllers/internship.controller";
import { authMiddleware } from "./middleware";
import {
  enrollInInternship,
  submitGithubLink,
} from "./controllers/enrollment.controller";
import mongoose from "mongoose";

const app = express();
dotenv.config();
const PORT = config.port || 3000;

// Middleware
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Development: Server is running" });
});

const authRouter = Router();
const userRouter = Router();
const internshipRouter = Router();
const taskRouter = Router();
const enrollmentRouter = Router();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/internships", internshipRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/enrollments", enrollmentRouter);

authRouter.post("/verify", verifyUser);

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/resetPassword/:token", resetPassword);
userRouter.get("/:id", getUser);

internshipRouter.post("/", createInternship);
internshipRouter.get("/", getInternships);
internshipRouter.get("/:id", getInternshipById);
internshipRouter.put("/:id", updateInternship);
internshipRouter.delete("/:id", deleteInternship);

taskRouter.post("/", createTask);
taskRouter.get("/", getTasks);
taskRouter.get("/:id", getTaskById);
taskRouter.put("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);

enrollmentRouter.post("/enroll", authMiddleware, enrollInInternship);
enrollmentRouter.post("/submit", authMiddleware, submitGithubLink);

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

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
