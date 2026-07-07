import express from "express";
import { contactUs } from "../controllers/contactUsController.js";
import turnstileMiddleware from "../middleware/turnstileMiddleware.js";

const router = express.Router();

router.post("/", turnstileMiddleware, contactUs);

export default router;
