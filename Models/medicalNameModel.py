from .database import get_connection

class MedicalNameModel:
    @staticmethod
    def get_all():
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, name, area FROM medical_names WHERE is_active = TRUE ORDER BY name"
            ).fetchall()

    @staticmethod
    def create(name: str, area: str = ''):
        with get_connection() as connection:
            row = connection.execute(
                'INSERT INTO medical_names (name, area) VALUES (%s, %s) RETURNING id, name, area',
                (name, area or ''),
            ).fetchone()
            connection.commit()
            return row
