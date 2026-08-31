from datetime import date
from pathlib import Path
import sqlite3

try:
    from Helper.password import hash_password
except ModuleNotFoundError:
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from Helper.password import hash_password

DATABASE_PATH = Path(__file__).resolve().parent / "hind_pharma.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def _next_year(value: date) -> date:
    try:
        return value.replace(year=value.year + 1)
    except ValueError:
        return value.replace(year=value.year + 1, day=28)


def _table_exists(connection, table_name):
    return connection.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table_name,)).fetchone() is not None


def _table_columns(connection, table_name):
    return {row[1] for row in connection.execute(f"PRAGMA table_info({table_name})").fetchall()}


def _legacy_users_need_migration(connection):
    if not _table_exists(connection, 'users'):
        return False
    columns = _table_columns(connection, 'users')
    sql = connection.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").fetchone()[0] or ''
    return 'admin_id' not in columns or "('manager','employee')" not in sql.replace(' ', '')


def _migrate_legacy_users(connection):
    if not _legacy_users_need_migration(connection):
        return
    legacy_rows = connection.execute("SELECT id,username,password_hash,role,is_active,created_at,updated_at FROM users").fetchall()
    connection.execute("PRAGMA foreign_keys=OFF")
    connection.execute("PRAGMA legacy_alter_table=ON")
    connection.execute("ALTER TABLE users RENAME TO users_legacy")
    connection.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('manager','employee')),
            name TEXT,
            phone TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
        )
    """)
    for row in legacy_rows:
        # The former Admin account is now the Hind Pharma tenant owner.
        if str(row['role']).lower() == 'admin':
            continue
        role = 'manager' if str(row['username']).lower() == 'hindpharma' else 'employee'
        password = hash_password(f"{row['username']}@123")
        connection.execute(
            """INSERT OR IGNORE INTO users(id,admin_id,username,password_hash,role,name,is_active,created_at,updated_at)
               VALUES(?,1,?,?,?,?,?,?,?)""",
            (row['id'], row['username'], password, role, row['username'], row['is_active'], row['created_at'], row['updated_at']),
        )
    connection.execute("DROP TABLE users_legacy")
    connection.execute("PRAGMA legacy_alter_table=OFF")
    connection.execute("PRAGMA foreign_keys=ON")


def _create_schema(connection):
    connection.executescript("""
        CREATE TABLE IF NOT EXISTS super_admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            name TEXT,
            business_name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            subscription_plan TEXT NOT NULL DEFAULT 'YEARLY',
            subscription_start TEXT NOT NULL,
            subscription_expiry TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('manager','employee')),
            name TEXT,
            phone TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS medicals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            area TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            UNIQUE(admin_id,name,area)
        );
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            product_id TEXT,
            code TEXT,
            name TEXT NOT NULL,
            unit TEXT,
            mrp REAL,
            formula TEXT,
            company TEXT,
            image TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            UNIQUE(admin_id,product_id)
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            medical_id INTEGER,
            created_by INTEGER,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            FOREIGN KEY(medical_id) REFERENCES medicals(id) ON DELETE SET NULL,
            FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            price REAL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT
        );
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER,
            user_id INTEGER,
            actor_type TEXT NOT NULL,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id TEXT,
            details TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE SET NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
        );
    """)


def _ensure_tenant_columns(connection):
    for table in ('medicals','products','orders'):
        if _table_exists(connection, table) and 'admin_id' not in _table_columns(connection, table):
            connection.execute(f"ALTER TABLE {table} ADD COLUMN admin_id INTEGER")
    connection.execute("UPDATE medicals SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE products SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE orders SET admin_id=1 WHERE admin_id IS NULL")


def _seed_accounts(connection):
    today = date.today()
    expiry = _next_year(today).isoformat()
    if not connection.execute("SELECT 1 FROM admins WHERE username='Ayaz'").fetchone():
        connection.execute("""INSERT INTO admins(username,password_hash,name,business_name,subscription_plan,subscription_start,subscription_expiry)
                           VALUES(?,?,?,?,?,?,?)""",
                           ('Ayaz', hash_password('Ayaz@123'), 'Ayaz', 'Hind Pharma', 'YEARLY', today.isoformat(), expiry))
    if not connection.execute("SELECT 1 FROM admins WHERE username='riyaz'").fetchone():
        connection.execute("""INSERT INTO admins(username,password_hash,name,business_name,subscription_plan,subscription_start,subscription_expiry)
                           VALUES(?,?,?,?,?,?,?)""",
                           ('riyaz', hash_password('riyaz@123'), 'Riyaz', 'India Medical Agency', 'YEARLY', today.isoformat(), expiry))
    if not connection.execute("SELECT 1 FROM super_admins WHERE username='Muhammed'").fetchone():
        connection.execute("INSERT INTO super_admins(username,password_hash,name) VALUES(?,?,?)", ('Muhammed', hash_password('Muhammed@123'), 'Muhammed'))


def _migrate_existing_data(connection):
    # All existing Hind Pharma records belong to tenant 1.
    _ensure_tenant_columns(connection)
    connection.execute("UPDATE medicals SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE products SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE orders SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE users SET admin_id=1,role='manager',name=COALESCE(name,username),password_hash=? WHERE lower(username)='hindpharma'", (hash_password('HindPharma@123'),))


def initialize_database():
    with get_connection() as connection:
        _create_schema(connection)
        _seed_accounts(connection)
        _migrate_legacy_users(connection)
        _create_schema(connection)
        _migrate_existing_data(connection)
        connection.executescript("""
            CREATE INDEX IF NOT EXISTS idx_users_admin_id ON users(admin_id);
            CREATE INDEX IF NOT EXISTS idx_medicals_admin_id ON medicals(admin_id);
            CREATE INDEX IF NOT EXISTS idx_products_admin_id ON products(admin_id);
            CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
            CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
            CREATE INDEX IF NOT EXISTS idx_orders_admin_id ON orders(admin_id);
            CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
            CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON audit_logs(admin_id);
            CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
        """)


if __name__ == '__main__':
    initialize_database()
    print(f'Database ready: {DATABASE_PATH}')
