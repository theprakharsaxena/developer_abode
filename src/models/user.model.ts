import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
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

const User = model<IUser>("User", userSchema);

export default User;
