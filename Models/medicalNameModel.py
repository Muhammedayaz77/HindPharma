from .database import get_connection

class MedicalNameModel:
    @staticmethod
    def get_all():
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, name, area FROM medical_names ORDER BY name"
            ).fetchall()
