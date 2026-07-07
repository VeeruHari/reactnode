import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reactnode",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

export async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }

  return pool;
}
