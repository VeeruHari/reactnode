import express from "express";
import { register, verifyEmail, login, checkSession, logout } from "../controllers/authController.js";
import turnstileMiddleware from "../middleware/turnstileMiddleware.js";

const router = express.Router();

router.post("/register", turnstileMiddleware, register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-session", checkSession);

export default router;
