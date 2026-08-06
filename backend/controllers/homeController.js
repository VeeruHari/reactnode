import { getPool } from "../db.js";

export const listGallery = async (req, res) => {

    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;

    try {
        const connection = await getPool();

        let sql = `SELECT id, title, description, image, price, stock FROM gallery WHERE is_active = TRUE AND stock > 0`;

        const params = [];
        if (cursor) {
            sql += " AND id < ?";
            params.push(cursor);
        }
        sql += ` ORDER BY id DESC LIMIT ?`;
        params.push(limit + 1); // Fetch one extra record to check if there's more

        const [galleryList] = await connection.query(sql, params);

        const hasMore = galleryList.length > limit;
        if (hasMore) {
            galleryList.pop(); // Remove the extra record
        }

        const nextCursor = galleryList.length ? galleryList[galleryList.length - 1].id : null;

        res.json({
            success: true,
            galleries: galleryList,
            nextCursor,
            hasMore
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Failed to fetch gallery",
        });
    }
};

export const searchGallery = async (req, res) => {
    const { text } = req.body;

    try {
        const connection = await getPool();

        // Step 1: Semantic search using Qdrant
        const response = await fetch(
            `${process.env.PYTHON_SEARCH_API_URL}/search/text`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            }
        );

        if (!response.ok) {
            throw new Error(`Python Search API returned ${response.status}`);
        }

        const results = await response.json();

        // No matches
        if (!results.length) {
            return res.json({
                success: true,
                galleries: [],
            });
        }

        // Step 2: Extract ids and scores
        const ids = results.map(item => item.gallery_id);

        const scoreMap = {};
        results.forEach(item => {
            scoreMap[item.gallery_id] = item.score;
        });

        // Step 3: Fetch gallery details from MySQL
        const placeholders = ids.map(() => "?").join(",");

        const [galleryList] = await connection.execute(`SELECT id, title, description, image, price, stock FROM gallery WHERE is_active = TRUE AND stock > 0 AND id IN (${placeholders})`,
            ids
        );

        // Step 4: Preserve Qdrant ranking
        const galleryMap = {};
        galleryList.forEach(gallery => {
            galleryMap[gallery.id] = gallery;
        });

        const orderedResults = ids
            .map(id => {
                const gallery = galleryMap[id];

                if (!gallery) return null;

                return {
                    ...gallery,
                    score: scoreMap[id],
                };
            })
            .filter(Boolean);

        return res.json({
            success: true,
            galleries: orderedResults,
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};