from database import get_connection, initialize_database

# Temporary local API facade.
# Frontend never talks to SQLite directly; future FastAPI endpoints can replace these functions.

def get_medicals():
    with get_connection() as connection:
        return [dict(row) for row in connection.execute('SELECT * FROM medicals WHERE is_active = 1 ORDER BY name')]


def get_products(search_text=''):
    with get_connection() as connection:
        if search_text:
            pattern = f'%{search_text}%'
            rows = connection.execute('''SELECT * FROM products WHERE is_active = 1 AND
                (name LIKE ? OR code LIKE ? OR product_id LIKE ? OR company LIKE ? OR formula LIKE ?)
                ORDER BY name''', (pattern, pattern, pattern, pattern, pattern))
        else:
            rows = connection.execute('SELECT * FROM products WHERE is_active = 1 ORDER BY name')
        return [dict(row) for row in rows]


def get_users():
    with get_connection() as connection:
        return [dict(row) for row in connection.execute('SELECT id, username, role, is_active, created_at, updated_at FROM users ORDER BY username')]


if __name__ == '__main__':
    initialize_database()
