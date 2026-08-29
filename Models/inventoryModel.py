from .database import get_connection

class InventoryModel:
    @staticmethod
    def get_for_product(product_id: str):
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, product_id, current_stock, batch, expiry FROM inventory WHERE product_id = %s ORDER BY id",
                (product_id,),
            ).fetchall()
