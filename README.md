# PharmaFlow — by Hind HealthCare

## Three Independent Clients

PharmaFlow is a multi-tenant pharma wholesale management platform developed under **Hind HealthCare**, the healthcare technology vertical of **Hind Tech Group**. Hind Pharma is one customer/shop tenant using the product. Each client owns its own backend support files, database definitions, seed/data files, helpers, assets and client code. No client imports source code from another client.

```text
PharmaFlow/
├── web/
│   ├── Backend/
│   ├── database/
│   ├── data/
│   ├── Helper/
│   ├── Models/
│   ├── View/
│   ├── View Model/
│   └── Assets/
├── android/
│   ├── Backend/
│   ├── database/
│   ├── data/
│   ├── Helper/
│   └── app/
└── ios/
    ├── Backend/
    ├── database/
    ├── data/
    ├── Helper/
    └── HindPharmaApp/
```

The root contains project-level documentation and CI/tooling only. Runtime/backend/database/data dependencies are not shared from the root between clients.

## FINAL TESTING LINKS

### Final tenant URL structure

`https://hindhealthcare.hindtechgroup.co.in/pharmaflow/{customer-slug}`

Examples:

- `https://hindhealthcare.hindtechgroup.co.in/pharmaflow/xyz-pharma`
- `https://hindhealthcare.hindtechgroup.co.in/pharmaflow/abc-pharma`
- `https://hindhealthcare.hindtechgroup.co.in/pharmaflow/hind-pharma`

All customers use the same PharmaFlow application and Home template; tenant data is loaded dynamically from the customer slug and protected APIs use the authenticated business identity.

Use these links in this order. **HTG Super Admin is a completely separate group-level flow from all Hind Pharma shop users.**

### 1. HTG Super Admin — group-level system login

**Login:** https://muhammedayaz77.github.io/HindPharma/View/htg-super-admin-login.html

After successful login it opens the HTG Super Admin Dashboard automatically.

- Username: `Muhammed`
- Dashboard: https://muhammedayaz77.github.io/HindPharma/View/htg-super-admin.html

HTG Super Admin is the parent-level control role. It manages HTG business units/tenant shops and their business Admin accounts. It never enters a shop Home through this flow.

### 2. Hind Pharma — Shop Home

**Shop Home:** https://hindhealthcare.hindtechgroup.co.in/pharmaflow/hind-pharma

- Admin username: `Ayaz`
- Employees:
  - Aman — `aman`
  - Rafe — `rafe`
  - Furkhan — `furkhan`

Hind Pharma is the populated testing tenant and keeps the existing medical/product data.

### 3. India Medical Agency — Shop Home

**Shop Home:** https://hindhealthcare.hindtechgroup.co.in/pharmaflow/india-medical-agency

- Admin username: `riyaz`
- Temporary testing data: **0 medicals, 0 products, 1 admin user**

The India Medical Agency tenant has its own shop identity and logo. It must never display Hind Pharma's shop name.

## FINAL ROLE FLOW

### HTG Super Admin

`HTG Super Admin Login → HTG Super Admin Dashboard`

HTG Super Admin is above individual business Admins and is not a shop user.

### PharmaFlow — by Hind HealthCare Admin

`Hind Pharma Shop Home → Admin Dashboard → manage Hind Pharma business`

### Manager

`Shop Home → Employee work + Manager Dashboard → Logout`

### Employee

`Shop Home → Daily Calling / Start Order → Logout`

The hierarchy is:

`HTG Super Admin → Business Admin → Manager → Employee`

For Hind Pharma specifically:

`HTG Super Admin → Hind Pharma Admin → Manager → Employee`

## FINAL ORDER FLOW

Exactly the same for Admin, Manager and Employee:

`Home → Medical List → Select Medical → Product List → Select Products → Final Order → Submit Order`

Do not jump directly from Home to Final Order. Browser Back should return through the normal sequence.

## FINAL DAILY CALLING FLOW

`Home → Daily Calling → Today's Medicals → Medical Name + Mobile → Tap Mobile → 📞 Call → isCall automatically recorded → Picked / Not Picked`


## Product / Database / Deployment

Hind Pharma uses one database per environment:

- **Local:** SQLite for development and testing.
- **Live:** MySQL on the production hosting server.
- The same 13 logical tables are used in both environments.
- Multiple shops/tenants share the production database and are isolated by tenant/business relationships.
- Do not commit production MySQL credentials to GitHub.

The backend selects the database from `DATABASE_URL`. See `.env.example` for the local and production configuration examples.

**Important:** GitHub Pages is only the static frontend/prototype. The live application must use the FastAPI backend connected to the production MySQL database.
