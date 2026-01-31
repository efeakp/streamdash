import mariadb
import os

def get_connection():
    return mariadb.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "efe"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "suds_database"),
        port=int(os.getenv("DB_PORT", 3306))
    )
