export async function up(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS gallery (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          description TEXT DEFAULT NULL,
          price DECIMAL(10, 2) DEFAULT 0.0,
          stock INT(5) DEFAULT 0,
          image VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
}

export async function down(connection) {
    await connection.query(`
        DROP TABLE gallery;
    `);
}