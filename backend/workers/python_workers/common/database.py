import os
import mysql.connector

_connection = None

def get_connection():
    global _connection

    if _connection is None or not _connection.is_connected():
        _connection = mysql.connector.connect(
            host=os.getenv("BACKEND_DB_HOST"),
            port=int(os.getenv("BACKEND_DB_PORT", "3306")),
            user=os.getenv("BACKEND_DB_USER"),
            password=os.getenv("BACKEND_DB_PASSWORD"),
            database=os.getenv("BACKEND_DB_NAME"),
        )

    return _connection