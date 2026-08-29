from dataclasses import dataclass
from typing import Optional

from .database import get_connection

@dataclass
class Product:
    id: str
    name: str
    mrp: float
    formula: Optional[str]
    company: str

class ProductModel:
    @staticmethod
    def get_all(limit: int = 100, offset: int = 0):
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, name, mrp, formula, company FROM products ORDER BY name LIMIT %s OFFSET %s",
                (limit, offset),
            ).fetchall()

    @staticmethod
    def search(query: str, limit: int = 50):
        with get_connection() as connection:
            return connection.execute(
                "SELECT id, name, mrp, formula, company FROM products WHERE name ILIKE %s OR company ILIKE %s ORDER BY name LIMIT %s",
                (f"%{query}%", f"%{query}%", limit),
            ).fetchall()
