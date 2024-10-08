import { Router } from "express";
import {
  verifyUser,
  forgotPassword,
  getUser,
  loginUser,
  registerUser,
  resetPassword,
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
  enrollInInternship,
  submitGithubLink,
  getUserInternships,
  generateImage,
  generateWelcomeImage,
  createOrder,
  verifyPayment,
} from "./controller";
import { authMiddleware } from "./middleware";

const authRouter = Router();
const userRouter = Router();
const internshipRouter = Router();
const taskRouter = Router();
const enrollmentRouter = Router();
const imageRouter = Router();
const paymentRouter = Router();

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify-payment", verifyPayment);
paymentRouter.post("/", getInternships);

authRouter.post("/verify", verifyUser);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/resetPassword/:token", resetPassword);
userRouter.get("/get", authMiddleware, getUser);

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
enrollmentRouter.get("/enrolled", authMiddleware, getUserInternships);
enrollmentRouter.post("/submit", authMiddleware, submitGithubLink);

imageRouter.get("/generate-image", generateImage);
imageRouter.get("/generate-welcome-image", generateWelcomeImage);

export {
  authRouter,
  userRouter,
  internshipRouter,
  taskRouter,
  enrollmentRouter,
  imageRouter,
  paymentRouter,
};
