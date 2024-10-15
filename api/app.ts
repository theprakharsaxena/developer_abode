import express from "express";
import cors from "cors";
import helmet from "helmet";
import {
  authRouter,
  enrollmentRouter,
  imageRouter,
  internshipRouter,
  paymentRouter,
  taskRouter,
  userRouter,
} from "./router";

const app = express();

// Enable CORS for all routes and origins
app.use(cors());
// Middleware
app.use(helmet());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/internships", internshipRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/enrollments", enrollmentRouter);
app.use("/api/v1/images", imageRouter);
app.use("/api/v1/payments", paymentRouter);

export default app;
