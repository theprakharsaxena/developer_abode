import { Router } from "express";
import {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
} from "../controllers/internship.controller";

const router = Router();

router.post("/", createInternship);
router.get("/", getInternships);
router.get("/:id", getInternshipById);
router.put("/:id", updateInternship);
router.delete("/:id", deleteInternship);

export default router;
