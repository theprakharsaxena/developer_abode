import express from "express";
import helmet from "helmet";

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());

// app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/users", userRouter);
// app.use("/api/v1/internships", internshipRouter);
// app.use("/api/v1/tasks", taskRouter);
// app.use("/api/v1/enrollments", enrollmentRouter);

export default app;
