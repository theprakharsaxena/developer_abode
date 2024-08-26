import { Request, Response } from "express";
import Enrollment from "../models/enrollment.model";
import Internship from "../models/internship.model";
import TaskSubmission from "../models/TaskSubmission.model";

export const enrollInInternship = async (req: Request, res: Response) => {
  console.log("+++++++", req.user);

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
