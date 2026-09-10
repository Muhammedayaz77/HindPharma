# Hind Pharma local backend

The application now uses a multi-tenant SQLite architecture:

View → ViewModel → API → FastAPI → SQLite

## Role hierarchy

Super Admin → Admin → Manager → Employee

- Super Admin creates, activates/deactivates, resets and permanently deletes Admin tenants.
- Admin owns one pharma business and can manage Managers, Employees, Products, Medicals and Orders.
- Manager can create Employees, add/edit Products and Medicals, work on Orders and view the dashboard. Manager cannot delete.
- Employee can perform every order-related task but cannot access the dashboard or manage Products/Medicals/Users.

## Subscription

Each Admin has a 1-year subscription. There is no grace period. A warning is shown to Admin, Manager and Employee during the 30 days before expiry. At expiry, the whole tenant loses access until renewal.

## Initial accounts

Initial account passwords are intentionally not documented in repository files. Use the secure local test configuration or reset flow when credentials are required.

Passwords are stored as hashes by the backend. Super Admin password reset for an Admin restores the configured reset rule; no custom reset password is accepted.

## Deletion and audit

Business records are permanently deleted after a confirmation prompt. There is no soft delete. Audit logging is limited to important account/security administration; routine product, medical and order actions are not logged.

## Start

Run the backend from this client directory:

```bash
cd ios/Backend
python start_local.py
```

The API runs at `http://127.0.0.1:8000`.

The SQLite database is generated locally inside this client's backend. JSON files under the client's `data/` directory remain as backups/import sources.

## Important

GitHub Pages cannot run the Python backend. Use the local backend with a local frontend server for DB-backed testing.
