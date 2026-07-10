import { getPool } from "../db.js";

export async function contactUs(req, res) {
  try {
    const { firstName, lastName, email, phone, comments, file, turnstileToken } = req.body;

    if (!firstName || !lastName || !email || !turnstileToken) {
      return res.status(400).json({
        success: false,
        message: "Please fill in the required fields and complete the challenge."
      });
    }

    const isHuman = await req.verifyTurnstileToken(
      turnstileToken, 
      process.env.TURNSTILE_SECRET_KEY
    );

    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: "Turnstile verification failed. Please try again."
      });
    }

    const connection = await getPool();
    const [result] = await connection.execute(
      `
        INSERT INTO contact_messages (first_name, last_name, email, phone_number, comments)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        phone?.trim() || null,
        comments?.trim() || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Your message has been saved successfully.",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error saving contact form:", error);
    res.status(500).json({
      success: false,
      message: "Unable to save your message right now. Please try again later."
    });
  }
}
