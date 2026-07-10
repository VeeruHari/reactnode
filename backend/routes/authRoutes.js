import express from "express";
import { register, verifyEmail } from "../controllers/authController.js";
import turnstileMiddleware from "../middleware/turnstileMiddleware.js";

const router = express.Router();

router.post("/register", turnstileMiddleware, register);
router.get("/verify-email", verifyEmail);

export default router;
