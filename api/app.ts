import express from "express";
import helmet from "helmet";
import {
  authRouter,
  enrollmentRouter,
  imageRouter,
  internshipRouter,
  taskRouter,
  userRouter,
} from "./router";

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/internships", internshipRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/enrollments", enrollmentRouter);
app.use("/api/v1/images", imageRouter);

export default app;
