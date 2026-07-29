import express from "express";
import { adminOnly } from '../middleware/adminMiddleware.js';
import fileUpload from "../services/fileUploadService.js";
import { getGallery, saveGallery, deleteGallery, updateGallery } from "../controllers/admin/galleryController.js";

const router = express.Router();

router.get("/gallery", adminOnly, getGallery);
router.post("/gallery/saveGallery", adminOnly, fileUpload("gallery").single("image"), saveGallery);
router.put("/gallery/:id", adminOnly, fileUpload("gallery").single("image"), updateGallery);
router.patch("/gallery/:id", adminOnly, deleteGallery);

export default router;