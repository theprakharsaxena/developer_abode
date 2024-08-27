import express from "express";
import helmet from "helmet";
// import userRoutes from "./routes/user.routes";
// import internshipRoutes from "./routes/internship.routes";
// import enrollmentRoutes from "./routes/enrollment.routes";
// import taskRoutes from "./routes/task.routes";
// import authRoutes from "./routes/auth.routes";

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());

// Routes
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/internships", internshipRoutes);
// app.use("/api/v1/tasks", taskRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);

export default app;
