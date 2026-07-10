export async function up(connection) {
    await connection.query(`
        ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE AFTER password_hash, 
        ADD COLUMN verification_token VARCHAR(255) NULL AFTER is_active;
    `);
}

export async function down(connection) {
    await connection.query(`
        ALTER TABLE users
        DROP COLUMN is_active,
        DROP COLUMN verification_token;
    `);
}