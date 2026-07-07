export async function up(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone_number VARCHAR(30),
          comments TEXT,
          attachment VARCHAR(255),
          recaptcha BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
}

export async function down(connection) {
    await connection.query(`
        DROP TABLE contact_messages;
    `);
}