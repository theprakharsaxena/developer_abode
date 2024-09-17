import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface ITaskSubmission extends Document {
  task: Schema.Types.ObjectId;
  githubLink: string;
  liveLink: string;
  isCompleted: boolean;
  isInReview: boolean;
  errorMessage: string;
  forReviewDate: Date;
}

const taskSubmissionSchema = new Schema<ITaskSubmission>({
  task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  githubLink: { type: String, default: "" },
  liveLink: { type: String, default: "" },
  isCompleted: { type: Boolean, default: false },
  isInReview: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
  forReviewDate: { type: Date, default: Date.now },
});

export const TaskSubmission = model<ITaskSubmission>(
  "TaskSubmission",
  taskSubmissionSchema
);

interface IEnrollment extends Document {
  user: Schema.Types.ObjectId;
  internship: Schema.Types.ObjectId | IInternship;
  startDate: Date;
  endDate: Date;
  taskSubmissions: Schema.Types.ObjectId[] | ITaskSubmission[];
  isInternshipFinished: boolean;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  internship: {
    type: Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
  },
  startDate: { type: Date, default: Date.now },
  endDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }, // 1 month later
  taskSubmissions: [{ type: Schema.Types.ObjectId, ref: "TaskSubmission" }],
  isInternshipFinished: { type: Boolean, default: false },
});

export const Enrollment = model<IEnrollment>("Enrollment", EnrollmentSchema);

interface IInternship extends Document {
  title: string;
  description: string;
  mediaUrl?: string;
  tasks: Schema.Types.ObjectId[] | ITask[]; // Reference to the Task model
}

const internshipSchema = new Schema<IInternship>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }], // Array of task references
});

export const Internship = model<IInternship>("Internship", internshipSchema);

interface ITask extends Document {
  title: string;
  description: string;
  mediaUrl: string;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String, required: true },
});

export const Task = model<ITask>("Task", taskSchema);

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiry: Date | null;
  resetToken?: string;
  resetTokenExpiry?: Date;
  comparePassword: (password: string) => Promise<boolean>;
  createPasswordResetToken: () => string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  verificationCodeExpiry: { type: Date, default: null },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  return resetToken;
};

export const User = model<IUser>("User", userSchema);
