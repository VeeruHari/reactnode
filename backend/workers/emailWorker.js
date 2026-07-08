import amqp from "amqplib";
import { sendEmail } from "../services/emailService.js";
import { renderTemplate } from "../services/templateRenderer.js";

async function startWorker() {
    while (true) {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URL);

            console.log("Connected to RabbitMQ");

            const channel = await connection.createChannel();

            await channel.assertQueue("registration-email", {
                durable: true
            });

            console.log("Email worker is listening...");

            // consume messages
            channel.consume("registration-email", async (msg) => {
                if (!msg) {
                    return;
                }

                const user = JSON.parse(msg.content.toString());
                const siteUrl = process.env.SITE_URL;

                user.html = await renderTemplate("templates/emails/welcomeEmail.html", {
                    name: user.name,
                    verification_link: `${siteUrl}/verify-email?token=${user.token}`
                });

                try {
                    await sendEmail(user);

                    channel.ack(msg);

                } catch (err) {
                    console.error("Failed to send registration email:", err);

                    channel.nack(msg, false, true);
                }
            });

            break;

        } catch (err) {
            console.log("RabbitMQ not ready. Retrying in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

startWorker().catch((error) => {
    console.error("Failed to start email worker:", error);
    process.exit(1);
});
