from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection, initialize_database
from migrate_json_to_sqlite import migrate

initialize_database()
app = FastAPI(title='Hind Pharma Local API', version='1.1.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])

class MedicalInput(BaseModel):
    name: str
    area: Optional[str] = None

class ProductInput(BaseModel):
    product_id: Optional[str] = None
    code: Optional[str] = None
    name: str
    unit: Optional[str] = None
    mrp: Optional[float] = None
    formula: Optional[str] = None
    company: Optional[str] = None
    image: Optional[str] = None

class UserInput(BaseModel):
    username: str
    password_hash: str
    role: str = 'user'

class OrderItemInput(BaseModel):
    product_id: int
    quantity: int

class OrderInput(BaseModel):
    medical_id: Optional[int] = None
    created_by: int
    items: list[OrderItemInput]

@app.get('/api/health')
def health():
    return {'status': 'ok', 'database': 'sqlite'}

@app.get('/api/medicals')
def medicals(search: str = ''):
    pattern = f'%{search.strip()}%'
    with get_connection() as db:
        rows = db.execute('SELECT * FROM medicals WHERE is_active=1 AND (name LIKE ? OR area LIKE ?) ORDER BY name', (pattern, pattern)).fetchall()
        return [dict(row) for row in rows]

@app.post('/api/medicals')
def add_medical(item: MedicalInput):
    name = item.name.strip()
    if not name: raise HTTPException(400, 'Medical name is required')
    try:
        with get_connection() as db:
            cursor = db.execute('INSERT INTO medicals(name,area) VALUES(?,?)', (name, item.area))
            return dict(db.execute('SELECT * FROM medicals WHERE id=?', (cursor.lastrowid,)).fetchone())
    except Exception:
        raise HTTPException(409, 'Medical already exists')

@app.delete('/api/medicals/{medical_id}')
def delete_medical(medical_id: int):
    with get_connection() as db:
        cursor = db.execute('UPDATE medicals SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE id=? AND is_active=1', (medical_id,))
        if cursor.rowcount == 0: raise HTTPException(404, 'Medical not found')
    return {'status':'ok'}

@app.get('/api/products')
def products(search: str = ''):
    pattern = f'%{search.strip()}%'
    with get_connection() as db:
        rows = db.execute('''SELECT * FROM products WHERE is_active=1 AND (name LIKE ? OR code LIKE ? OR product_id LIKE ? OR company LIKE ? OR formula LIKE ?) ORDER BY name''', (pattern, pattern, pattern, pattern, pattern)).fetchall()
        return [dict(row) for row in rows]

@app.post('/api/products')
def add_product(item: ProductInput):
    with get_connection() as db:
        try:
            cursor = db.execute('''INSERT INTO products(product_id,code,name,unit,mrp,formula,company,image) VALUES(?,?,?,?,?,?,?,?)''', tuple(item.model_dump().values()))
            return dict(db.execute('SELECT * FROM products WHERE id=?', (cursor.lastrowid,)).fetchone())
        except Exception:
            raise HTTPException(409, 'Product with this ID already exists')

@app.post('/api/products/bulk')
def add_products(items: list[ProductInput]):
    with get_connection() as db:
        for item in items:
            try:
                db.execute('''INSERT INTO products(product_id,code,name,unit,mrp,formula,company,image) VALUES(?,?,?,?,?,?,?,?)''', tuple(item.model_dump().values()))
            except Exception as error:
                raise HTTPException(409, f'Bulk import failed for product: {item.name}') from error
    return {'status':'ok', 'count':len(items)}

@app.delete('/api/products/{product_id}')
def delete_product(product_id: int):
    with get_connection() as db:
        cursor = db.execute('UPDATE products SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE id=? AND is_active=1', (product_id,))
        if cursor.rowcount == 0: raise HTTPException(404, 'Product not found')
    return {'status':'ok'}

@app.get('/api/users')
def users():
    with get_connection() as db:
        rows = db.execute('SELECT id,username,role,is_active,created_at,updated_at FROM users ORDER BY username').fetchall()
        return [dict(row) for row in rows]

@app.post('/api/users')
def add_user(item: UserInput):
    if item.role not in ('admin','user'): raise HTTPException(400, 'Invalid role')
    with get_connection() as db:
        try:
            cursor = db.execute('INSERT INTO users(username,password_hash,role) VALUES(?,?,?)', (item.username.strip(), item.password_hash, item.role))
            return dict(db.execute('SELECT id,username,role,is_active,created_at,updated_at FROM users WHERE id=?', (cursor.lastrowid,)).fetchone())
        except Exception:
            raise HTTPException(409, 'Username already exists')

@app.delete('/api/users/{user_id}')
def delete_user(user_id: int):
    with get_connection() as db:
        cursor = db.execute('UPDATE users SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE id=? AND is_active=1', (user_id,))
        if cursor.rowcount == 0: raise HTTPException(404, 'User not found')
    return {'status':'ok'}

@app.post('/api/orders')
def create_order(order: OrderInput):
    if not order.items: raise HTTPException(400, 'Order must contain at least one product')
    with get_connection() as db:
        cursor = db.execute('INSERT INTO orders(medical_id,created_by) VALUES(?,?)', (order.medical_id, order.created_by))
        order_id = cursor.lastrowid
        for item in order.items:
            if item.quantity < 1: raise HTTPException(400, 'Quantity must be at least 1')
            db.execute('INSERT INTO order_items(order_id,product_id,quantity) VALUES(?,?,?)', (order_id, item.product_id, item.quantity))
    return {'status':'ok','order_id':order_id}

@app.get('/api/orders')
def get_orders():
    with get_connection() as db:
        orders = [dict(row) for row in db.execute('SELECT * FROM orders ORDER BY id DESC').fetchall()]
        for order in orders:
            order['items'] = [dict(row) for row in db.execute('SELECT * FROM order_items WHERE order_id=?', (order['id'],)).fetchall()]
        return orders

@app.post('/api/admin/migrate')
def run_migration():
    migrate()
    return {'status': 'ok', 'message': 'JSON backup migrated to SQLite'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
