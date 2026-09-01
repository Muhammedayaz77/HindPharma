-- Hind Pharma SQLite multi-tenant schema
-- Runtime source of truth: Backend/database.py

CREATE TABLE IF NOT EXISTS super_admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Super Admin control tables intentionally use the superAdmin prefix.
CREATE TABLE IF NOT EXISTS superAdminTenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    subtitle TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    dl_20b TEXT,
    dl_21b TEXT,
    fssai TEXT,
    gstin TEXT,
    logo TEXT,
    barcode TEXT,
    upi TEXT,
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS superAdminApplications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    admin_username TEXT NOT NULL,
    admin_name TEXT,
    application_status TEXT NOT NULL DEFAULT 'pending_payment',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenant_id) REFERENCES superAdminTenants(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS superAdminPayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    tenant_id INTEGER,
    amount REAL NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    payment_method TEXT,
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(application_id) REFERENCES superAdminApplications(id) ON DELETE CASCADE,
    FOREIGN KEY(tenant_id) REFERENCES superAdminTenants(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS superAdminActivityLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    tenant_id INTEGER,
    application_id INTEGER,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenant_id) REFERENCES superAdminTenants(id) ON DELETE SET NULL,
    FOREIGN KEY(application_id) REFERENCES superAdminApplications(id) ON DELETE SET NULL
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
    tenant_id INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    subscription_plan TEXT NOT NULL DEFAULT 'YEARLY',
    subscription_start TEXT NOT NULL,
    subscription_expiry TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenant_id) REFERENCES superAdminTenants(id) ON DELETE SET NULL
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
    phone TEXT,
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

CREATE TABLE IF NOT EXISTS calling_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    medical_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    called_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_call INTEGER NOT NULL DEFAULT 1 CHECK(is_call IN (0,1)),
    is_pick INTEGER,
    is_not_pick INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY(medical_id) REFERENCES medicals(id) ON DELETE CASCADE,
    FOREIGN KEY(employee_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK ((is_pick IS NULL AND is_not_pick IS NULL) OR ((is_pick IN (0,1)) AND (is_not_pick IN (0,1)) AND (is_pick + is_not_pick = 1)))
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

CREATE INDEX IF NOT EXISTS idx_superAdminTenants_slug ON superAdminTenants(slug);
CREATE INDEX IF NOT EXISTS idx_superAdminApplications_status ON superAdminApplications(application_status);
CREATE INDEX IF NOT EXISTS idx_superAdminPayments_status ON superAdminPayments(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_admin_id ON users(admin_id);
CREATE INDEX IF NOT EXISTS idx_medicals_admin_id ON medicals(admin_id);
CREATE INDEX IF NOT EXISTS idx_products_admin_id ON products(admin_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_orders_admin_id ON orders(admin_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_calling_logs_admin_id ON calling_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_calling_logs_employee_id ON calling_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_calling_logs_medical_id ON calling_logs(medical_id);
CREATE INDEX IF NOT EXISTS idx_calling_logs_called_at ON calling_logs(called_at);
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
