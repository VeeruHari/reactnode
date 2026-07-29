import multer from "multer";
import path from "path";

export default function fileUpload(folder) {
    const storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, path.join("uploads", folder));
        },

        filename(req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    return multer({ storage });
}