from .database import get_connection

class OrderModel:
    @staticmethod
    def create(medical_name_id: int, customer_note: str | None = None):
        with get_connection() as connection:
            row = connection.execute(
                "INSERT INTO orders (medical_name_id, customer_note) VALUES (%s, %s) RETURNING id, created_at",
                (medical_name_id, customer_note),
            ).fetchone()
            connection.commit()
            return row

    @staticmethod
    def add_item(order_id: int, product_id: str, quantity: int):
        with get_connection() as connection:
            row = connection.execute(
                "INSERT INTO order_items (order_id, product_id, quantity) VALUES (%s, %s, %s) RETURNING id",
                (order_id, product_id, quantity),
            ).fetchone()
            connection.commit()
            return row
