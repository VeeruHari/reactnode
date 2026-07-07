export async function up(connection) {
    await connection.query(`
        ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE AFTER recaptcha, 
        ADD COLUMN verification_token VARCHAR(255) AFTER is_active, 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_at;
    `);
}

export async function down(connection) {
    await connection.query(`
        ALTER TABLE users
        DROP COLUMN is_active,
        DROP COLUMN verification_token,
        DROP COLUMN updated_at;
    `);
}