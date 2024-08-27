import { Request, Response } from "express";
import Task from "./models/task.model";
import Internship from "./models/internship.model";
import Enrollment from "./models/enrollment.model";
import TaskSubmission from "./models/TaskSubmission.model";
import User from "./models/user.model";
import { generateToken } from "./utils";
import crypto from "crypto";
import { sendEmail } from "./utils";

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

export const registerUser = async (req: Request, res: Response) => {
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

export const loginUser = async (req: Request, res: Response) => {
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

export const getUser = async (req: Request, res: Response) => {
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

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  const { title, description, mediaUrl } = req.body;

  try {
    const task = await Task.create({ title, description, mediaUrl });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific task by ID
export const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, dueDate } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, dueDate },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new internship
export const createInternship = async (req: Request, res: Response) => {
  const { title, description, mediaUrl, tasks } = req.body;

  try {
    const internship = await Internship.create({
      title,
      description,
      mediaUrl,
      tasks,
    });
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all internships with populated tasks
export const getInternships = async (req: Request, res: Response) => {
  try {
    const internships = await Internship.find().populate("tasks");
    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific internship by ID with populated tasks
export const getInternshipById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const internship = await Internship.findById(id).populate("tasks");
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update an internship
export const updateInternship = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, mediaUrl, tasks } = req.body;

  try {
    const internship = await Internship.findByIdAndUpdate(
      id,
      { title, description, mediaUrl, tasks },
      { new: true }
    );
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an internship
export const deleteInternship = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const internship = await Internship.findByIdAndDelete(id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json({ message: "Internship deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const enrollInInternship = async (req: Request, res: Response) => {
  const userId = (req.user as { id: string }).id; // Extract userId from req.user
  const { internshipId } = req.body;

  try {
    // Find the internship to get the tasks
    const internship = await Internship.findById(internshipId).populate(
      "tasks"
    );
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // Create task submissions
    const taskSubmissions = await Promise.all(
      internship.tasks.map(async (task: any) => {
        const taskSubmission = await TaskSubmission.create({
          task: task._id,
          githubLink: "", // Initially empty, will be filled later
        });
        return taskSubmission._id;
      })
    );

    // Create the enrollment
    const newEnrollment = await Enrollment.create({
      user: userId,
      internship: internshipId,
      taskSubmissions: taskSubmissions,
    });

    res.status(201).json(newEnrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitGithubLink = async (req: Request, res: Response) => {
  const userId = (req.user as { id: string }).id; // Extract userId from req.user
  const { enrollmentId, taskId, githubLink } = req.body;

  try {
    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    }).populate("taskSubmissions");
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Find the task submission and update the GitHub link
    const taskSubmission = await TaskSubmission.findOne({
      _id: { $in: enrollment.taskSubmissions },
      task: taskId,
    });
    if (!taskSubmission) {
      return res.status(404).json({ message: "Task not found in enrollment" });
    }

    taskSubmission.githubLink = githubLink;
    await taskSubmission.save();

    res
      .status(200)
      .json({ message: "GitHub link submitted successfully", taskSubmission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
