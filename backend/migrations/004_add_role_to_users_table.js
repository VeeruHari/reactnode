export async function up(connection) {
    await connection.query(`
        ALTER TABLE users ADD COLUMN role INTEGER(2) NOT NULL DEFAULT 0 AFTER verification_token;
    `);
}

export async function down(connection) {
    await connection.query(`
        ALTER TABLE users
        DROP COLUMN role;
    `);
}