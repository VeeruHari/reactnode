import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getPool } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import PublicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { runMigrations } from "./migrations/migrationRunner.js";
import { createSessionMiddleware } from "./middleware/sessionMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

global.appName = "Reflex";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use(cors({
  origin: process.env.SITE_URL,
  credentials: true,
}));

app.use(createSessionMiddleware());

app.use("/api", PublicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running!"
  });
});

async function initializeDatabase() {
  const connection = await getPool();

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await runMigrations(connection);

      console.log("Database is ready.");
      return;
    } catch (error) {
      if (attempt === 10) {
        throw error;
      }

      console.log(`Waiting for MySQL to be ready (attempt ${attempt}/10)...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend server:", error);
  process.exit(1);
});
