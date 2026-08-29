from .database import get_connection

class CompanyModel:
    @staticmethod
    def get_all():
        with get_connection() as connection:
            return connection.execute("SELECT id, name FROM companies ORDER BY name").fetchall()
