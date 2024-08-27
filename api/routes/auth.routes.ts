import { Router } from "express";
import { verifyUser } from "../controllers/auth.controller";

const router = Router();

// Route for email verification
router.post("/verify", verifyUser);

export default router;
