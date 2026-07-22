import crypto from "crypto";
import { promisify } from "util";
import { getPool } from "../db.js";
import { publishToQueue } from "../services/rabbitmqService.js";

const scryptAsync = promisify(crypto.scrypt);

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

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

async function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(":");

    const config = {
        cost: 16384,
        blockSize: 8,
        parallelization: 1
    };

    const derivedKey = await scryptAsync(password, salt, 64, config);

    return crypto.timingSafeEqual(
        Buffer.from(hash, "hex"),
        derivedKey
    );
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
    const verificationToken = generateVerificationToken();
    const [result] = await connection.execute(
      `
        INSERT INTO users (first_name, last_name, email, phone_number, password_hash, verification_token)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        phone?.trim() || null,
        passwordHash,
        verificationToken
      ]
    );

    const name = `${firstName.trim()} ${lastName.trim()}`;
    await publishToQueue("registration-email", {
        userId: result.insertId,
        name,
        email,
        token: verificationToken
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

export async function verifyEmail(req, res) {
  try {
    const token = req.query?.token || req.body?.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "A verification token is required."
      });
    }

    const connection = await getPool();
    const [rows] = await connection.execute(
      "SELECT id, is_active FROM users WHERE verification_token = ? LIMIT 1",
      [token]
    );

    console.log("Verification token query result:", rows);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "This verification link is invalid or has expired."
      });
    }

    const user = rows[0];

    if (user.is_active) {
      return res.status(200).json({
        success: true,
        message: "This email address is already verified."
      });
    }

    await connection.execute(
      "UPDATE users SET is_active = TRUE, verification_token = NULL, updated_at = NOW() WHERE id = ?",
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login to your account."
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Unable to verify your email at this time."
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in the required fields."
      });
    }

    const connection = await getPool();

    const [users] = await connection.execute(
        "SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1",
        [email.toLowerCase()]
    );

    if (users.length === 0) {
        return res.status(401).json({
            message: "Invalid email address."
        });
    }

    const isPasswordValid = await verifyPassword(
        password,
        users[0].password_hash
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid password."
        });
    }

    if (!req.session) {
      req.session = {};
    }

    req.session.userId = users[0].id;
    req.session.role = users[0].role;
    
    res.status(201).json({
      success: true,
      message: "Login successful.",
      user: {
        userId: users[0].id,
        role: users[0].role
      }
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({
      success: false,
      message: "Unable to login now. Please try again later."
    });
  }
}

export function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });
        }

        res.clearCookie("connect.sid");

        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
}

export function checkSession(req, res) {
  if (!req.session.userId) {
      return res.status(401).json({
          authenticated: false
      });
  }

  res.json({
      authenticated: true,
      user: {
          id: req.session.userId,
          role: req.session.role
      }
  });
}
