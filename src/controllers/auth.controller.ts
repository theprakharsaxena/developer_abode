import { Request, Response } from "express";
import User from "../models/user.model";

// Verify user's email
export const verifyUser = async (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (
      user.verificationCodeExpiry &&
      user.verificationCodeExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;

    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
