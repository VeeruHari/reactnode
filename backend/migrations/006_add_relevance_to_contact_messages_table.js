export async function up(connection) {
    await connection.query(`
        ALTER TABLE contact_messages ADD COLUMN relevance VARCHAR(50) DEFAULT NULL AFTER emotion_confidence, ADD COLUMN relevance_confidence DECIMAL(5,4) DEFAULT NULL AFTER relevance;
    `);
}

export async function down(connection) {
    await connection.query(`
        ALTER TABLE contact_messages
        DROP COLUMN relevance,
        DROP COLUMN relevance_confidence;
    `);
}