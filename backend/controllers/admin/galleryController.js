import fs from "fs/promises";
import path from "path";
import { getPool } from "../../db.js";

export const saveGallery = async (req, res) => {

    const connection = await getPool();

    try {
        //console.log(req.file);   // Uploaded file details
        //console.log(req.body);   // Other form fields

        const image = req.file.filename;

        const [result] = await connection.execute(
            `INSERT INTO gallery (title, description, price, stock, image)
                VALUES (?, ?, ?, ?, ?)`,
            [
                req.body.title.trim(),
                req.body.description.trim(),
                req.body.price.trim(),
                req.body.stock.trim(),
                image
            ]
        );

        const gallery = await getSingleGallery(result.insertId);

        res.status(201).json({
            success: true,
            gallery: gallery,
            message: "Image uploaded successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Upload failed"
        });
    }
};

export const getGallery = async (req, res) => {

    const connection = await getPool();

    try {
        const [galleryList] = await connection.execute(
            "SELECT id, title, description, image, price, stock FROM gallery WHERE is_active = TRUE AND stock > 0 ORDER BY id DESC"
        );

        res.json({
            success: true,
            galleries: galleryList,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Failed to fetch gallery",
        });
    }
};

export const getSingleGallery = async (id) => {
    const connection = await getPool();

    const [rows] = await connection.execute(
        "SELECT * FROM gallery WHERE id = ?",
        [id]
    );

    return rows[0] || null;
};

export const deleteGallery = async (req, res) => {

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        const [rows] = await connection.execute(
            "SELECT image FROM gallery WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        const image = rows[0].image;

        await connection.execute(
            "UPDATE gallery SET is_active = FALSE WHERE id = ?",
            [ id ]
        );

        await connection.commit();

        // Delete image file
        if (image) {
            const imagePath = path.join(
                process.cwd(),
                "uploads",
                "gallery",
                image
            );

            try {
                await fs.unlink(imagePath);
            } catch (err) {
                console.warn("Image file not found:", imagePath);
            }
        }

        res.json({
            success: true,
            message: "Gallery deleted successfully",
        });

    } catch (error) {
        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateGallery = async (req, res) => {

    const connection = await getPool();

    try {
        const { id } = req.params;
        const { title, description, price, stock } = req.body;

        if (req.file) {
            await connection.execute(
                `UPDATE gallery SET title = ?, description = ?, price = ?, stock = ?, image = ? WHERE id = ?`,
                [title, description, price, stock, req.file.filename, id]
            );
        } else {
            await connection.execute(
                `UPDATE gallery SET title = ?, description = ?, price = ?, stock = ? WHERE id = ?`,
                [title, description, price, stock, id]
            );
        }

        const gallery = await getSingleGallery(id);

        res.json({
        success: true,
        gallery: gallery,
        message: "Gallery updated successfully.",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
        success: false,
        message: "Failed to update gallery.",
        });
    }
}