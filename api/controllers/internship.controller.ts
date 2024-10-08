import { Request, Response } from "express";
import Internship from "../models/internship.model";

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
