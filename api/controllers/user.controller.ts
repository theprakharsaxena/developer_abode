import { Request, Response } from "express";
import User from "../models/user.model";
import { generateToken } from "../utils/jwt";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail";

const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification code
    const verificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase(); // Generate a 6-digit code
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpiry,
    });

    await sendEmail(
      newUser.email,
      "Email Verification",
      `Your verification code is: ${verificationCode}`
    );
    res
      .status(201)
      .json({ message: "User registered, verification email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).send("Invalid email or password");
    }
    const token = generateToken(user._id as string);
    res.send({ token });
  } catch (error) {
    res.status(400).send(error);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    // Send reset email
    try {
      await sendEmail(
        user.email,
        "Password Reset",
        `Reset your password here: ${resetUrl}`
      );
      res
        .status(200)
        .json({ message: "Password reset link sent to your email" });
    } catch (emailError) {
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Error sending email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token and compare it to the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user by the reset token
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update the password and clear the reset token fields
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // Send the new token back
    res.json({
      message: "Password reset successful",
      token: generateToken(user._id as string),
    });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

export { registerUser, loginUser, getUser };
