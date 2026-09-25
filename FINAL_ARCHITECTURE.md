# PharmaFlow — Final Architecture

This document is the locked workflow for **PharmaFlow**, the pharma wholesale management product under **Hind HealthCare** of **Hind Tech Group (HTG)**.

## HTG business hierarchy

**Hind Tech Group (HTG)** is the parent technology/business group.

- HTG Super Admin: group-level control across HTG business units and tenant shops.
- Business Admin: controls one specific HTG business/tenant.
- Manager: all Employee work + Manager work within that business.
- Employee: employee work only within that business.

For the Hind Pharma customer tenant:

`HTG Super Admin → Hind Pharma Admin → Manager → Employee`

`super_admin` remains the internal technical role identifier, but the user-facing role name is **HTG Super Admin**. The `admin` role is the business-level Admin and is tenant-scoped.

## Common order flow

Admin, Manager and Employee use exactly the same order flow:

`Home → Medical List → Select Medical → Product List → Select Products → Final Order → Submit Order`

There is no automatic jump to Final Order. Browser Back must follow the same natural sequence.

## Daily Calling

Admin, Manager and Employee can use:

`Home → Daily Calling → Today's Medicals → Medical Name + Mobile → Tap Mobile → Call → isCall automatically recorded → Picked / Not Picked`

There is no Create Order button after a call. If an order is needed, the user returns to Home and follows the normal order flow.

`isCall` is system-generated, not user-selectable. The server enforces a 10-second cooldown between call events. Rapid calling/suspicious activity is for Admin reporting only and is not shown to Employees.

## Shop Home

Admin, Manager and Employee all land on their shop's public Home after login. The Home is the central launcher.

- Employee: Daily Calling + Medical List.
- Manager: Employee functions + Manager Dashboard.
- Admin: Employee/Manager functions + Admin Dashboard.

The same shop Home can be opened publicly without login. Login is required for protected operations.

## Multi-tenant shops

A single PharmaFlow application serves multiple shops. The final public tenant URL hierarchy is:

`Hind Tech Group → Hind HealthCare → PharmaFlow → Customer/Tenant`

Tenant URL:

`/hindhealthcare/pharmaflow/{customer-slug}`

Examples:

- `/hindhealthcare/pharmaflow/xyz-pharma`
- `/hindhealthcare/pharmaflow/abc-pharma`
- `/hindhealthcare/pharmaflow/hind-pharma`

The same PharmaFlow Home template is rendered for every tenant. The URL slug identifies the public tenant page, but it is **not** a permission mechanism. Protected API access must derive the business identity from the authenticated token/admin relationship.

No separate HTML page is generated for every shop. The Home is rendered from tenant data.

## HTG Super Admin

HTG Super Admin works in a separate group-level dashboard and never enters a shop Home through the Super Admin flow.

When creating a new HTG business/shop, HTG Super Admin collects:

- Business/shop name
- Shop subtitle
- Address
- Phone/email
- Drug Licence 20B/21B if available
- FSSAI if available
- GSTIN if applicable
- Business/shop logo
- Barcode if applicable
- Shop UPI
- Business Admin name/username

The application starts as `pending_payment`. A new business Admin is generated only after payment is confirmed.

## Database architecture

The project uses **one database per environment**, not separate databases per shop:

- **Local development/testing:** SQLite (`web/Backend/hind_pharma.db`). This is kept for offline development and safe local testing.
- **Production/live hosting:** MySQL on the hosting server. The same FastAPI code selects MySQL through `DATABASE_URL`.
- **The 13 application tables are the same logical schema in both databases.**
- Shops are tenants inside the same production database; a separate database is not created for every shop.

### Tables

HTG Super Admin control tables use the `superAdmin` prefix:

- `superAdminTenants`
- `superAdminApplications`
- `superAdminPayments`
- `superAdminActivityLogs`

Operational tenant tables remain separate (`admins`, `users`, `medicals`, `products`, `orders`, `calling_logs`) and are tenant-scoped. The `admins` table represents business-level Admin accounts; it is not the HTG Super Admin account.

## Deployment architecture

`Browser → FastAPI/Python → MySQL → 13 application tables`

For local development:

`Browser → FastAPI/Python → SQLite → 13 application tables`

GitHub Pages remains a static frontend/prototype only; it is not the production database/backend. Live deployment branding is **PharmaFlow by Hind HealthCare**.

### Product and URL hierarchy

`Hind Tech Group → Hind HealthCare → PharmaFlow → Customer/Tenant`

`PharmaFlow` is intentionally present in the URL so future Hind HealthCare products can have their own URL namespace without mixing customer routes. The live deployment must run the FastAPI backend on hosting and connect it to the hosting MySQL database. A real payment gateway/webhook must be connected before treating a payment as independently verified in production.

### Production configuration

Set `DATABASE_URL` in the hosting environment to the MySQL connection string. Never commit the real MySQL username/password to GitHub.

Example:

`mysql+pymysql://MYSQL_USER:MYSQL_PASSWORD@MYSQL_HOST:3306/MYSQL_DATABASE`

The local `.env.example` keeps SQLite as the default development database.
