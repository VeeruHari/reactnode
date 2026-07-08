import { renderTemplate } from "../services/templateRenderer.js";

const html = await renderTemplate(
    "templates/emails/welcomeEmail.html",
    {
        name: user.name,
        verification_link: verificationUrl
    }
);