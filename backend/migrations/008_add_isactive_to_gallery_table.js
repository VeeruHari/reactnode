export async function up(connection) {
    await connection.query(`
        ALTER TABLE gallery ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER image;
    `);
}

export async function down(connection) {
    await connection.query(`
        ALTER TABLE users
        DROP COLUMN is_active;
    `);
}