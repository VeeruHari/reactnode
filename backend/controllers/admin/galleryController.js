import fs from "fs/promises";
import path from "path";
import { getPool } from "../../db.js";
import { publishToQueue } from "../../services/rabbitmqService.js";

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

        if (result.insertId) {
            await publishToQueue(
                "gallery_embedding",
                {
                    gallery_id: result.insertId,
                    title: req.body.title,
                    description: req.body.description,
                    image
                }
            );

            const gallery = await getSingleGallery(result.insertId);

            res.status(201).json({
                success: true,
                gallery: gallery,
                message: "Image uploaded successfully"
            });
        } else {
            res.status(500).json({
                message: "Upload failed"
            });
        }
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
            "SELECT id, title, description, image, price, stock FROM gallery WHERE is_active = TRUE AND stock > 0 ORDER BY updated_at DESC"
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

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const { title, description, price, stock } = req.body;

        await connection.beginTransaction();

        // Get existing gallery
        const gallery = await getSingleGallery(id);

        if (!gallery) {
            throw new Error("Gallery not found");
        }

        let image = gallery.image;

        if (req.file) {
            // Delete old image
            if (gallery.image) {
                const imagePath = path.join(
                    process.cwd(),
                    "uploads",
                    "gallery",
                    gallery.image
                );

                try {
                    await fs.unlink(imagePath);
                } catch (err) {
                    if (err.code !== "ENOENT") {
                        throw err;
                    }
                }
            }

            image = req.file.filename;

            await publishToQueue(
                "gallery_embedding",
                {
                    gallery_id: id,
                    title: title,
                    description: description,
                    image
                }
            );
        }

        await connection.execute(
            `UPDATE gallery SET title = ?, description = ?, price = ?, stock = ?, image = ? WHERE id = ?`,
            [title, description, price, stock, image, id]
        );

        await connection.commit();

        const updatedGallery = await getSingleGallery(id);

        res.json({
            success: true,
            gallery: updatedGallery,
            message: "Gallery updated successfully.",
        });
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}