import crypto from "crypto";
import { promisify } from "util";
import { getPool } from "../db.js";
import { publishToQueue } from "../services/rabbitmqService.js";

const scryptAsync = promisify(crypto.scrypt);

const token = crypto.randomBytes(32).toString("hex");

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  const config = { 
    cost: 16384,
    blockSize: 8,
    parallelization: 1
  };

  const derivedKey = await scryptAsync(password, salt, 64, config);

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, password, turnstileToken } = req.body;

    if (!firstName || !lastName || !email || !password || !turnstileToken) {
      return res.status(400).json({
        success: false,
        message: "Please fill in the required fields and complete the challenge."
      });
    }

    const isHuman = await req.verifyTurnstileToken(
      turnstileToken,
      process.env.TURNSTILE_SECRET_KEY_REG
    );

    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: "Turnstile verification failed. Please try again."
      });
    }

    const connection = await getPool();
    const passwordHash = await hashPassword(password);
    const [result] = await connection.execute(
      `
        INSERT INTO users (first_name, last_name, email, phone_number, password_hash, recaptcha, is_active, verification_token, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        phone?.trim() || null,
        passwordHash,
        true,
        false,
        token
      ]
    );

    // Publish a job to the RabbitMQ queue for sending a registration email
    const name = `${firstName.trim()} ${lastName.trim()}`;
    await publishToQueue("registration-email", {
        userId: result.insertId,
        name,
        email
    });

    res.status(201).json({
      success: true,
      message: "Registration completed successfully. You will receive a confirmation email shortly.",
      id: result.insertId
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    console.error("Error saving registration form:", error);
    res.status(500).json({
      success: false,
      message: "Unable to complete registration right now. Please try again later."
    });
  }
}
