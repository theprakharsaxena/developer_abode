import express, { Router } from "express";
import helmet from "helmet";
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
} from "./controller";
import { authMiddleware } from "./middleware";

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());

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

export default app;
