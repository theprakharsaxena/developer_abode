import { Request, Response } from "express";
import {
  Task,
  Internship,
  Enrollment,
  TaskSubmission,
  User,
  ITaskSubmission,
} from "./models";
import { generateToken } from "./utils";
import crypto from "crypto";
import { sendEmail } from "./utils";
import { createCanvas, loadImage } from "canvas";

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
    // Check if all required fields are present
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields (name, email, password) are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Generate a 6-digit code
    const verificationCodeExpiry = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ); // Code expires in 7 days

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpiry,
    });

    // Send verification email
    await sendEmail(
      newUser.email,
      "Email Verification",
      `<p>Your verification code is: ${verificationCode}</p>`
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
    const id = user._id as string;
    const token = generateToken(id);
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
    const appName = "developerabode";
    const webUrl = "https://www.developerabode.com";
    const resetUrl = `${appName}://reset-Password/${resetToken}`;
    const webresetUrl = `${webUrl}/reset-Password/${resetToken}`;
    // Send reset email
    try {
      await sendEmail(
        user.email,
        "Password Reset",
        `<p>Hello,</p>
<p>You requested to reset your password. Click the link below to reset your password:</p>
<a href="${webresetUrl}" target="_blank">
  Reset your password
</a>
<p>If you didn't request this, you can ignore this email.</p>
`
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
  const userId = (req.user as { id: string }).id; // Extract userId from req.user
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    const { name, email, isVerified } = user;
    res.send({ name, email, isVerified });
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
    // Check if the user is already enrolled in the internship

    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      internship: internshipId,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this internship" });
    }

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

export const getUserInternships = async (req: Request, res: Response) => {
  const userId = (req.user as { id: string }).id; // Extract userId from req.user

  try {
    // Find all enrollments for the user and populate the internship details
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: "internship",
        populate: { path: "tasks" }, // Populate tasks inside internships
      })
      .populate({
        path: "taskSubmissions", // Populate taskSubmissions
        populate: { path: "task" }, // Populate task inside each taskSubmission
      });

    if (!enrollments || enrollments.length === 0) {
      return res
        .status(404)
        .json({ message: "No enrollments found for this user" });
    }

    // Use for...of to allow async/await
    for (const enrollment of enrollments) {
      // Cast taskSubmissions as an array of ITaskSubmission
      const taskSubmissions = enrollment.taskSubmissions as ITaskSubmission[];

      for (const taskSubmission of taskSubmissions) {
        if (
          new Date(taskSubmission.forReviewDate) < new Date() &&
          taskSubmission.isInReview
        ) {
          try {
            // Find the current task submission to ensure the conditions are met
            const taskSubmissionCheck = await TaskSubmission.findById(
              taskSubmission._id
            );

            // Check if the taskSubmission exists and passes the conditions
            if (
              taskSubmissionCheck &&
              taskSubmissionCheck.githubLink.includes("github.com")
            ) {
              await TaskSubmission.findByIdAndUpdate(
                taskSubmission._id,
                { isCompleted: true, isInReview: false },
                { new: true }
              );
            } else if (
              taskSubmissionCheck &&
              !taskSubmissionCheck.githubLink.includes("github.com")
            ) {
              await TaskSubmission.findByIdAndUpdate(
                taskSubmission._id,
                {
                  errorMessage:
                    "TaskSubmission not marked as completed due to failing conditions: githubLink",
                  isInReview: false,
                },
                { new: true }
              );
            }
          } catch (error) {
            console.error(
              `Error marking TaskSubmission ${taskSubmission._id} as completed: `,
              error
            );
          }
        }
      }
    }

    // Refetch the updated enrollments to return the latest data
    const updatedEnrollments = await Enrollment.find({ user: userId })
      .populate({
        path: "internship",
        populate: { path: "tasks" }, // Populate tasks inside internships
      })
      .populate({
        path: "taskSubmissions", // Populate taskSubmissions
        populate: { path: "task" }, // Populate task inside each taskSubmission
      });

    res.status(200).json(updatedEnrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitGithubLink = async (req: Request, res: Response) => {
  const userId = (req.user as { id: string }).id; // Extract userId from req.user
  const { enrollmentId, taskId, githubLink, liveLink } = req.body;

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
    taskSubmission.liveLink = liveLink;
    taskSubmission.errorMessage = "";
    taskSubmission.isInReview = true;
    taskSubmission.forReviewDate = new Date(Date.now() + 10 * 60 * 1000);
    await taskSubmission.save();

    res
      .status(200)
      .json({ message: "GitHub link submitted successfully", taskSubmission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateImage = async (req: Request, res: Response) => {
  try {
    // Get the texts from the query parameters, with default values
    const { text1 = "Official", text2 = "Verified" } = req.query;

    // Load the image from the provided URL
    const imageUrl = "https://www.developerabode.com/welcomeLetterOfficial.png";
    const image = await loadImage(imageUrl).catch((err) => {
      console.error("Failed to load image:", err);
      res.status(500).json({ error: "Image loading error" });
      return null;
    });
    if (!image) return; // Early exit if image loading failed

    // Create a canvas with the same dimensions as the image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Set text properties
    ctx.font = "600 25px";
    ctx.fillStyle = "#323232";
    ctx.textAlign = "right"; // For top-right text

    // Add the first text in the top-right corner
    ctx.fillText(text1.toString(), image.width - 137, 450); // 20px padding from the right, 60px from the top

    // Set new alignment for bottom-left text
    ctx.textAlign = "left"; // For bottom-left text

    // Add the second text in the bottom-left corner
    ctx.fillText(text2.toString(), 141, 605); // 20px padding from the left, 20px from the bottom

    const buffer = canvas.toBuffer("image/png");

    // Set the response headers for the image
    res.setHeader("Content-Type", "image/png");

    // Send the image as a response
    res.send(buffer);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const generateWelcomeImage = async (req: Request, res: Response) => {
  try {
    // Extract text1 and text2 from the request body, with default values
    const { text1 = "Official", text2 = "Verified" } = req.body;

    // Load the image from the provided URL
    const imageUrl = "https://www.developerabode.com/welcomeLetterOfficial.png";
    const image = await loadImage(imageUrl).catch((err) => {
      console.error("Failed to load image:", err);
      res.status(500).json({ error: "Image loading error" });
      return null;
    });
    if (!image) return; // Early exit if image loading failed

    // Create a canvas with the same dimensions as the image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Set text properties
    ctx.font = "600 25px";
    ctx.fillStyle = "#323232";
    ctx.textAlign = "right"; // For top-right text

    // Add the first text in the top-right corner
    ctx.fillText(text1.toString(), image.width - 137, 450); // 20px padding from the right, 60px from the top

    // Set new alignment for bottom-left text
    ctx.textAlign = "left"; // For bottom-left text

    // Add the second text in the bottom-left corner
    ctx.fillText(text2.toString(), 141, 605); // 20px padding from the left, 20px from the bottom

    const buffer = canvas.toBuffer("image/png");

    // Set the response headers for the image
    res.setHeader("Content-Type", "image/png");

    // Send the image as a response
    res.send(buffer);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
