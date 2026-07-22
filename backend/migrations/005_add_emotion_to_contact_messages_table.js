export async function up(connection) {
    await connection.query(`
        ALTER TABLE contact_messages ADD COLUMN emotion VARCHAR(50) DEFAULT NULL AFTER comments, ADD COLUMN emotion_confidence DECIMAL(5,4) DEFAULT NULL AFTER emotion, ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
    `);
}

export async function down(connection) {
    await connection.query(`
        ALTER TABLE contact_messages
        DROP COLUMN emotion,
        DROP COLUMN emotion_confidence;
    `);
}