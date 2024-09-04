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
} from "./controller";
import { authMiddleware } from "./middleware";

const authRouter = Router();
const userRouter = Router();
const internshipRouter = Router();
const taskRouter = Router();
const enrollmentRouter = Router();

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

export {
  authRouter,
  userRouter,
  internshipRouter,
  taskRouter,
  enrollmentRouter,
};
