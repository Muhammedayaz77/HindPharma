from .database import get_connection

class ProductModel:
    @staticmethod
    def get_all(limit: int = 100, offset: int = 0):
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, code, name, unit, mrp, formula, company FROM products WHERE is_active = TRUE ORDER BY name LIMIT %s OFFSET %s",
                (limit, offset),
            ).fetchall()

    @staticmethod
    def search(query: str, limit: int = 50):
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, code, name, unit, mrp, formula, company FROM products WHERE is_active = TRUE AND (name ILIKE %s OR company ILIKE %s OR code ILIKE %s) ORDER BY name LIMIT %s",
                (f"%{query}%", f"%{query}%", f"%{query}%", limit),
            ).fetchall()

    @staticmethod
    def create(product_id: str, code: str, name: str, unit: str, mrp, formula: str, company: str):
        with get_connection() as connection:
            company_id = None
            if company:
                row = connection.execute('SELECT id FROM companies WHERE name = %s', (company,)).fetchone()
                if row:
                    company_id = row['id']
                else:
                    row = connection.execute('INSERT INTO companies (name) VALUES (%s) RETURNING id', (company,)).fetchone()
                    company_id = row['id']
            row = connection.execute(
                """INSERT INTO products (id, code, name, unit, mrp, formula, company_id, company)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                   RETURNING id, code, name, unit, mrp, formula, company""",
                (product_id, code or None, name, unit or None, mrp, formula or None, company_id, company or None),
            ).fetchone()
            connection.commit()
            return row
