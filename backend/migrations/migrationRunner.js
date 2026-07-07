import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(connection) {

    //Create the migrations table if it doesn't exist
    await connection.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const files = (await fs.readdir(__dirname))
        .filter(file => file.endsWith(".js") && file !== "migrationRunner.js")
        .sort();

    for (const file of files) {

        const [rows] = await connection.query(
            "SELECT id FROM migrations WHERE name = ?",
            [file]
        );

        if (rows.length === 0) {

            const migration = await import(`./${file}`);

            await migration.up(connection);

            await connection.query(
                "INSERT INTO migrations (name) VALUES (?)",
                [file]
            );

            console.log(`${file} executed.`);
        }else {
            console.log(`${file} already executed.`);
        }
    }
}