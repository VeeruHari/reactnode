import express from "express";
import dotenv from "dotenv";
import { getPool } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactUsRoutes.js";
import { runMigrations } from "./migrations/migrationRunner.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

global.appName = "Reflex";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/api/register", authRoutes);
app.use("/api/contact", contactRoutes);

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
