from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection, initialize_database
from migrate_json_to_sqlite import migrate

initialize_database()
app = FastAPI(title='Hind Pharma Local API', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])

@app.get('/api/health')
def health():
    return {'status': 'ok', 'database': 'sqlite'}

@app.get('/api/medicals')
def medicals(search: str = ''):
    pattern = f'%{search.strip()}%'
    with get_connection() as db:
        rows = db.execute('SELECT * FROM medicals WHERE is_active=1 AND (name LIKE ? OR area LIKE ?) ORDER BY name', (pattern, pattern)).fetchall()
        return [dict(row) for row in rows]

@app.get('/api/products')
def products(search: str = ''):
    pattern = f'%{search.strip()}%'
    with get_connection() as db:
        rows = db.execute('''SELECT * FROM products WHERE is_active=1 AND
            (name LIKE ? OR code LIKE ? OR product_id LIKE ? OR company LIKE ? OR formula LIKE ?)
            ORDER BY name''', (pattern, pattern, pattern, pattern, pattern)).fetchall()
        return [dict(row) for row in rows]

@app.get('/api/users')
def users():
    with get_connection() as db:
        rows = db.execute('SELECT id,username,role,is_active,created_at,updated_at FROM users ORDER BY username').fetchall()
        return [dict(row) for row in rows]

@app.post('/api/admin/migrate')
def run_migration():
    migrate()
    return {'status': 'ok', 'message': 'JSON backup migrated to SQLite'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
