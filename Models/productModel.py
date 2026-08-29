from dataclasses import dataclass
from typing import Optional

from .database import get_connection

@dataclass
class Product:
    id: str
    code: Optional[str]
    name: str
    unit: Optional[str]
    mrp: Optional[float]
    formula: Optional[str]
    company: Optional[str]

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
