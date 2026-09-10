# Hind Pharma

## Three Independent Clients

Hind Pharma is maintained as three independent client projects. Each client owns its own backend support files, database definitions, seed/data files, helpers, assets and client code. No client imports source code from another client.

```text
HindPharma/
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

Use these links in this order. **HTG Super Admin is a completely separate group-level flow from all Hind Pharma shop users.**

### 1. HTG Super Admin — group-level system login

**Login:** https://muhammedayaz77.github.io/HindPharma/View/htg-super-admin-login.html

After successful login it opens the HTG Super Admin Dashboard automatically.

- Username: `Muhammed`
- Password: `Muhammed@123`
- Dashboard: https://muhammedayaz77.github.io/HindPharma/View/htg-super-admin.html

HTG Super Admin is the parent-level control role. It manages HTG business units/tenant shops and their business Admin accounts. It never enters a shop Home through this flow.

### 2. Hind Pharma — Shop Home

**Shop Home:** https://muhammedayaz77.github.io/HindPharma/shop/hind-pharma

- Admin username: `Ayaz`
- Admin password: `Ayaz@123`
- Employees:
  - Aman — `aman` / `aman@123`
  - Rafe — `rafe` / `rafe@123`
  - Furkhan — `furkhan` / `furkhan@123`

Hind Pharma is the populated testing tenant and keeps the existing medical/product data.

### 3. India Medical Agency — Shop Home

**Shop Home:** https://muhammedayaz77.github.io/HindPharma/shop/india-medical-agency

- Admin username: `riyaz`
- Admin password: `riyaz@123`
- Temporary testing data: **0 medicals, 0 products, 1 admin user**

The India Medical Agency tenant has its own shop identity and logo. It must never display Hind Pharma's shop name.

## FINAL ROLE FLOW

### HTG Super Admin

`HTG Super Admin Login → HTG Super Admin Dashboard`

HTG Super Admin is above individual business Admins and is not a shop user.

### Hind Pharma Admin

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
