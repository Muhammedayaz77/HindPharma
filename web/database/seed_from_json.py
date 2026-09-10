import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'

from Backend.database import get_connection, initialize_database


def load(name, default=None):
    path = DATA / name
    if not path.exists():
        return [] if default is None else default
    with path.open(encoding='utf-8') as file:
        return json.load(file)


def seed():
    initialize_database()
    products = load('products.json')
    medicals = load('medicals.json')

    with get_connection() as db:
        for medical in medicals:
            name = str(medical.get('name', '')).strip()
            if not name:
                continue
            db.execute('INSERT OR IGNORE INTO medicals(admin_id,name,area) VALUES(1,?,?)', (name, medical.get('area')))

        for product in products:
            name = str(product.get('name', '')).strip()
            if not name:
                continue
            db.execute('''INSERT INTO products(admin_id,product_id,code,name,unit,mrp,formula,company,image)
                          VALUES(?,?,?,?,?,?,?,?,?)
                          ON CONFLICT(admin_id,product_id) DO UPDATE SET
                          code=excluded.code,name=excluded.name,unit=excluded.unit,mrp=excluded.mrp,
                          formula=excluded.formula,company=excluded.company,image=excluded.image,
                          updated_at=CURRENT_TIMESTAMP''',
                       (1, product.get('id'), product.get('code'), name, product.get('unit'), product.get('mrp'),
                        product.get('formula'), product.get('company'), product.get('image')))
    print(f'SQLite seed complete: {len(medicals)} medicals, {len(products)} products')


if __name__ == '__main__':
    seed()
