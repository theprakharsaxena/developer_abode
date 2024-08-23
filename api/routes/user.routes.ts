import { Router } from "express";
import {
  loginUser,
  getUser,
  registerUser,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);
router.get("/:id", getUser);

export default router;
