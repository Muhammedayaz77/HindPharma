from .database import get_connection

class SupplierModel:
    @staticmethod
    def get_all():
        with get_connection() as connection:
            return connection.execute("SELECT id, name FROM suppliers WHERE is_active = TRUE ORDER BY name").fetchall()
