import express from "express";

import { listGallery, searchGallery } from "../controllers/homeController.js";
import { contactUs } from "../controllers/contactUsController.js";

import turnstileMiddleware from "../middleware/turnstileMiddleware.js";

const router = express.Router();

router.get("/home", listGallery);
router.post("/home/search", searchGallery);
router.post("/contact", turnstileMiddleware, contactUs);

export default router;
