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

- Super Admin: `Muhammed` / `Muhammed@123`
- Hind Pharma Admin: `Ayaz` / `Ayaz@123`
- Hind Pharma Manager: existing `HindPharma` user / `HindPharma@123`
- India Medical Agency Admin: `riyaz` / `riyaz@123`

Passwords are stored as hashes by the backend. Super Admin password reset for an Admin always restores `username@123`; no custom reset password is accepted.

## Deletion and audit

Business records are permanently deleted after a confirmation prompt. There is no soft delete. Audit logging is limited to important account/security administration; routine product, medical and order actions are not logged.

## Start

From the repository root:

```bash
python Backend/start_local.py
```

The API runs at `http://127.0.0.1:8000`.

The SQLite database is generated locally as `Backend/hind_pharma.db`. JSON files under `data/` remain as backups/import sources.

## Important

GitHub Pages cannot run the Python backend. Use the local backend with a local frontend server for DB-backed testing.
