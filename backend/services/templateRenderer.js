import fs from "fs/promises";

export async function renderTemplate(templatePath, data) {
    let html = await fs.readFile(templatePath, "utf8");

    return html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
}