# Hind Pharma — Final Architecture

This document is the locked workflow for the project.

## HTG business hierarchy

**Hind Tech Group (HTG)** is the parent technology/business group.

- HTG Super Admin: group-level control across HTG business units and tenant shops.
- Business Admin: controls one specific HTG business/tenant.
- Manager: all Employee work + Manager work within that business.
- Employee: employee work only within that business.

For the Hind Pharma tenant:

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

A single application serves multiple shops. Shop identity is represented by a slug:

`/shop/{shop-slug}`

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

## SQLite tables

HTG Super Admin control tables use the `superAdmin` prefix:

- `superAdminTenants`
- `superAdminApplications`
- `superAdminPayments`
- `superAdminActivityLogs`

Operational tenant tables remain separate (`admins`, `users`, `medicals`, `products`, `orders`, `calling_logs`) and are tenant-scoped. The `admins` table represents business-level Admin accounts; it is not the HTG Super Admin account.

## Important deployment note

GitHub Pages is static, so the browser-side prototype stores newly created tenant metadata locally. The SQLite/FastAPI backend contains the persistent multi-tenant schema and payment-gated API routes for the real deployment. A real payment gateway/webhook must be connected before treating a payment as independently verified in production.
