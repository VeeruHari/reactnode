import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mailpit",
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
        : undefined
});

export async function sendEmail(user) {
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: user.subject,
        text: user.text || '',
        html: user.html || ``
    });
}
