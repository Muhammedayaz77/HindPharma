CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    unit TEXT,
    mrp NUMERIC(12,2),
    formula TEXT,
    company_id BIGINT REFERENCES companies(id),
    company TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company);

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0,
    batch TEXT,
    expiry TEXT
);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id BIGINT REFERENCES suppliers(id),
    supplier TEXT,
    cost_price NUMERIC(12,2),
    purchase_price NUMERIC(12,2),
    sales_price NUMERIC(12,2),
    received_date TEXT,
    invoice_number TEXT,
    invoice_date TEXT
);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);

CREATE TABLE IF NOT EXISTS medical_names (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    area TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    medical_name_id BIGINT NOT NULL REFERENCES medical_names(id),
    customer_note TEXT,
    status TEXT NOT NULL DEFAULT 'prepared',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
