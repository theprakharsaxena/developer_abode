import { Router } from "express";
import {
  enrollInInternship,
  submitGithubLink,
} from "../controllers/enrollment.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post("/enroll", authMiddleware, enrollInInternship);
router.post("/submit", authMiddleware, submitGithubLink);

export default router;
