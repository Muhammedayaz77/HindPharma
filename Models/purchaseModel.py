from .database import get_connection

class PurchaseModel:
    @staticmethod
    def get_for_product(product_id: str):
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, product_id, supplier, cost_price, purchase_price, sales_price, received_date, invoice_number, invoice_date FROM purchases WHERE product_id = %s ORDER BY id",
                (product_id,),
            ).fetchall()
