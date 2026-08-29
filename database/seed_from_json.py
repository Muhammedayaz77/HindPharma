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
    suppliers = load("suppliers.json")
    categories = load("categories.json")
    inventory = load("inventory.json")
    purchases = load("purchases.json")

    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            for company in companies:
                cursor.execute("INSERT INTO companies (name) VALUES (%s) ON CONFLICT (name) DO NOTHING", (company["name"],))
            for supplier in suppliers:
                cursor.execute("INSERT INTO suppliers (name) VALUES (%s) ON CONFLICT (name) DO NOTHING", (supplier["name"],))
            for category in categories:
                cursor.execute("INSERT INTO categories (name) VALUES (%s) ON CONFLICT (name) DO NOTHING", (category["name"],))
            for medical in medical_names:
                cursor.execute("INSERT INTO medical_names (name, area) VALUES (%s, %s) ON CONFLICT (name) DO UPDATE SET area = EXCLUDED.area", (medical["name"], medical.get("area", "")))

            for product in products:
                company_name = (product.get("company") or "").strip()
                company_id = None
                if company_name:
                    cursor.execute("SELECT id FROM companies WHERE name = %s", (company_name,))
                    row = cursor.fetchone()
                    company_id = row[0] if row else None
                cursor.execute(
                    """INSERT INTO products (id, code, name, unit, mrp, formula, company_id, company)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT (id) DO UPDATE SET code=EXCLUDED.code,name=EXCLUDED.name,unit=EXCLUDED.unit,
                       mrp=EXCLUDED.mrp,formula=EXCLUDED.formula,company_id=EXCLUDED.company_id,company=EXCLUDED.company,
                       updated_at=NOW()""",
                    (product["id"], product.get("code"), product["name"], product.get("unit"), product.get("mrp"), product.get("formula"), company_id, company_name or None),
                )

            for item in inventory:
                cursor.execute(
                    """INSERT INTO inventory (id, product_id, current_stock, batch, expiry)
                       VALUES (%s,%s,%s,%s,%s)
                       ON CONFLICT (id) DO UPDATE SET product_id=EXCLUDED.product_id,current_stock=EXCLUDED.current_stock,
                       batch=EXCLUDED.batch,expiry=EXCLUDED.expiry""",
                    (item["id"], item["product_id"], item.get("current_stock", 0), item.get("batch"), item.get("expiry")),
                )

            for purchase in purchases:
                supplier_name = purchase.get("supplier")
                supplier_id = None
                if supplier_name:
                    cursor.execute("SELECT id FROM suppliers WHERE name = %s", (supplier_name,))
                    row = cursor.fetchone()
                    supplier_id = row[0] if row else None
                cursor.execute(
                    """INSERT INTO purchases (id, product_id, supplier_id, supplier, cost_price, purchase_price,
                       sales_price, received_date, invoice_number, invoice_date)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT (id) DO UPDATE SET product_id=EXCLUDED.product_id,supplier_id=EXCLUDED.supplier_id,
                       supplier=EXCLUDED.supplier,cost_price=EXCLUDED.cost_price,purchase_price=EXCLUDED.purchase_price,
                       sales_price=EXCLUDED.sales_price,received_date=EXCLUDED.received_date,
                       invoice_number=EXCLUDED.invoice_number,invoice_date=EXCLUDED.invoice_date""",
                    (purchase["id"], purchase["product_id"], supplier_id, supplier_name, purchase.get("cost_price"), purchase.get("purchase_price"), purchase.get("sales_price"), purchase.get("received_date"), purchase.get("invoice_number"), purchase.get("invoice_date")),
                )

        connection.commit()


if __name__ == "__main__":
    seed()
