from .database import get_connection

class UserModel:
    @staticmethod
    def find_by_username(username: str):
        with get_connection() as connection:
            return connection.execute(
                'SELECT id, username, password_hash, is_active FROM users WHERE username = %s',
                (username,),
            ).fetchone()
