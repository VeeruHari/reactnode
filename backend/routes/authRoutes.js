import express from "express";
import { register } from "../controllers/authController.js";
import turnstileMiddleware from "../middleware/turnstileMiddleware.js";

const router = express.Router();

router.post("/", turnstileMiddleware, register);

export default router;
