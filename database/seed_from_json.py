import json
import os
from pathlib import Path

import psycopg

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load(name):
    with (DATA / name).open(encoding="utf-8") as file:
        return json.load(file)


def seed():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured")

    products = load("products.json")
    medical_names = load("medicals.json")
    companies = load("companies.json")
    categories = load("categories.json")

    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            for company in companies:
                cursor.execute(
                    "INSERT INTO companies (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
                    (company["name"],),
                )

            for category in categories:
                cursor.execute(
                    "INSERT INTO categories (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
                    (category["name"],),
                )

            for medical in medical_names:
                cursor.execute(
                    "INSERT INTO medical_names (name, area) VALUES (%s, %s) ON CONFLICT (name) DO UPDATE SET area = EXCLUDED.area",
                    (medical["name"], medical.get("area", "")),
                )

            for product in products:
                company_name = (product.get("company") or "").strip() or "-BLANK-"
                cursor.execute("SELECT id FROM companies WHERE name = %s", (company_name,))
                company_row = cursor.fetchone()
                company_id = company_row[0] if company_row else None
                cursor.execute(
                    """INSERT INTO products (id, name, mrp, formula, company_id, company)
                       VALUES (%s, %s, %s, %s, %s, %s)
                       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, mrp=EXCLUDED.mrp,
                       formula=EXCLUDED.formula, company_id=EXCLUDED.company_id,
                       company=EXCLUDED.company, updated_at=NOW()""",
                    (product["id"], product["name"], product.get("mrp") or 0, product.get("formula"), company_id, company_name),
                )

        connection.commit()


if __name__ == "__main__":
    seed()
