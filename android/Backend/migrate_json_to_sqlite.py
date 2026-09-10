import json
from pathlib import Path
from database import get_connection, initialize_database

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'


def load_json(name, default):
    path = DATA / name
    if not path.exists():
        return default
    with path.open('r', encoding='utf-8') as file:
        return json.load(file)


def migrate():
    initialize_database()
    users = load_json('users.json', [])
    medicals = load_json('medicals.json', [])
    products = load_json('products.json', [])

    with get_connection() as connection:
        for user in users:
            connection.execute('''INSERT INTO users(username,password_hash,role,is_active)
                VALUES(?,?,?,?) ON CONFLICT(username) DO UPDATE SET
                password_hash=excluded.password_hash, role=excluded.role, is_active=excluded.is_active,
                updated_at=CURRENT_TIMESTAMP''',
                (user.get('username'), user.get('password_hash',''), user.get('role','user'), int(bool(user.get('is_active', True)))))

        for medical in medicals:
            name, area = medical.get('name','').strip(), medical.get('area')
            if not name:
                continue
            existing = connection.execute('SELECT id FROM medicals WHERE name=?', (name,)).fetchone()
            if existing:
                continue
            connection.execute('INSERT INTO medicals(name,area) VALUES(?,?)', (name, area))

        for product in products:
            product_id = product.get('id')
            if not product.get('name'):
                continue
            values = (product_id, product.get('code'), product.get('name',''), product.get('unit'), product.get('mrp'), product.get('formula'), product.get('company'), product.get('image'))
            existing = connection.execute('SELECT id FROM products WHERE product_id=?', (product_id,)).fetchone() if product_id else None
            if existing:
                connection.execute('''UPDATE products SET code=?,name=?,unit=?,mrp=?,formula=?,company=?,image=?,is_active=1,updated_at=CURRENT_TIMESTAMP WHERE product_id=?''', values[1:] + (product_id,))
            else:
                connection.execute('''INSERT INTO products(product_id,code,name,unit,mrp,formula,company,image) VALUES(?,?,?,?,?,?,?,?)''', values)

    print(f'Migration complete: {len(users)} users, {len(medicals)} medicals, {len(products)} products')


if __name__ == '__main__':
    migrate()
