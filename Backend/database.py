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


def _table_columns(connection, table_name):
    return {row[1] for row in connection.execute(f"PRAGMA table_info({table_name})").fetchall()}


def _table_exists(connection, table_name):
    return connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table_name,)
    ).fetchone() is not None


def _migrate_legacy_users(connection):
    if not _table_exists(connection, "users"):
        return
    columns = _table_columns(connection, "users")
    if "admin_id" in columns and "manager" in {row[4] for row in connection.execute("PRAGMA table_info(users)").fetchall() if row[2] == "role"}:
        return

    legacy_rows = connection.execute("SELECT id, username, password_hash, role, is_active, created_at, updated_at FROM users").fetchall()
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
        if str(row[3]).lower() == "admin":
            continue
        connection.execute(
            """INSERT OR IGNORE INTO users
            (id, admin_id, username, password_hash, role, name, is_active, created_at, updated_at)
            VALUES (?, 1, ?, ?, 'manager', ?, ?, ?, ?)""",
            (row[0], row[1], row[2], row[1], row[4], row[5], row[6]),
        )
    connection.execute("DROP TABLE users_legacy")


def _add_column(connection, table, column, definition):
    if column not in _table_columns(connection, table):
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


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
            UNIQUE(admin_id, name, area)
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
            UNIQUE(admin_id, product_id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            medical_id INTEGER,
            created_by INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            FOREIGN KEY(medical_id) REFERENCES medicals(id) ON DELETE SET NULL,
            FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
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


def _migrate_existing_data(connection):
    # Existing databases get tenant ownership without losing records.
    for table in ("medicals", "products", "orders"):
        _add_column(connection, table, "admin_id", "INTEGER")

    connection.execute("UPDATE medicals SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE products SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE orders SET admin_id=1 WHERE admin_id IS NULL")

    today = date.today()
    admin = connection.execute("SELECT id FROM admins WHERE username='Ayaz'").fetchone()
    if not admin:
        connection.execute(
            """INSERT INTO admins
            (username,password_hash,name,business_name,subscription_plan,subscription_start,subscription_expiry)
            VALUES (?,?,?,?,?,?,?)""",
            ("Ayaz", hash_password("Ayaz@123"), "Ayaz", "Hind Pharma", "YEARLY", today.isoformat(), _next_year(today).isoformat()),
        )

    connection.execute("UPDATE medicals SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE products SET admin_id=1 WHERE admin_id IS NULL")
    connection.execute("UPDATE orders SET admin_id=1 WHERE admin_id IS NULL")

    # Legacy product/medical tables may still have a global unique constraint; the new API scopes uniqueness by admin.
    riyaz = connection.execute("SELECT id FROM admins WHERE username='riyaz'").fetchone()
    if not riyaz:
        connection.execute(
            """INSERT INTO admins
            (username,password_hash,name,business_name,subscription_plan,subscription_start,subscription_expiry)
            VALUES (?,?,?,?,?,?,?)""",
            ("riyaz", hash_password("riyaz@123"), "Riyaz", "India Medical Agency", "YEARLY", today.isoformat(), _next_year(today).isoformat()),
        )

    # The former Hind Pharma user is promoted to Manager and remains under Hind Pharma.
    connection.execute(
        "UPDATE users SET admin_id=1, role='manager', name=COALESCE(name, username), updated_at=CURRENT_TIMESTAMP WHERE username='HindPharma'"
    )

    # Any remaining legacy user is retained as an employee under Hind Pharma.
    connection.execute(
        "UPDATE users SET admin_id=1, role='employee', name=COALESCE(name, username), updated_at=CURRENT_TIMESTAMP WHERE role NOT IN ('manager','employee')"
    )


def _seed_super_admin(connection):
    existing = connection.execute("SELECT id FROM super_admins WHERE username='Muhammed'").fetchone()
    if not existing:
        connection.execute(
            "INSERT INTO super_admins(username,password_hash,name) VALUES(?,?,?)",
            ("Muhammed", hash_password("Muhammed@123"), "Muhammed"),
        )


def initialize_database():
    with get_connection() as connection:
        # Create top-level tables first so legacy users can reference admins during migration.
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
        """)
        if not connection.execute("SELECT id FROM admins WHERE username='Ayaz'").fetchone():
            today = date.today()
            connection.execute(
                """INSERT INTO admins(username,password_hash,name,business_name,subscription_plan,subscription_start,subscription_expiry)
                VALUES(?,?,?,?,?,?,?)""",
                ("Ayaz", hash_password("Ayaz@123"), "Ayaz", "Hind Pharma", "YEARLY", today.isoformat(), _next_year(today).isoformat()),
            )
        if not connection.execute("SELECT id FROM admins WHERE username='riyaz'").fetchone():
            today = date.today()
            connection.execute(
                """INSERT INTO admins(username,password_hash,name,business_name,subscription_plan,subscription_start,subscription_expiry)
                VALUES(?,?,?,?,?,?,?)""",
                ("riyaz", hash_password("riyaz@123"), "Riyaz", "India Medical Agency", "YEARLY", today.isoformat(), _next_year(today).isoformat()),
            )

        _migrate_legacy_users(connection)
        _create_schema(connection)
        _migrate_existing_data(connection)
        _seed_super_admin(connection)

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
