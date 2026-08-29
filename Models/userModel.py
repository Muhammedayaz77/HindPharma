from .database import get_connection

class UserModel:
    @staticmethod
    def find_by_username(username: str):
        with get_connection() as connection:
            return connection.execute(
                'SELECT id, username, password_hash, role, is_active FROM users WHERE username = %s',
                (username,),
            ).fetchone()

    @staticmethod
    def create(username: str, password_hash: str, role: str = 'user'):
        with get_connection() as connection:
            row = connection.execute(
                'INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s) RETURNING id, username, role, is_active',
                (username, password_hash, role),
            ).fetchone()
            connection.commit()
            return row

    @staticmethod
    def get_all():
        with get_connection() as connection:
            return connection.execute(
                'SELECT id, username, role, is_active, created_at FROM users ORDER BY username'
            ).fetchall()
