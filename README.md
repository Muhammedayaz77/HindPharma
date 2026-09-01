# Hind Pharma

## Testing URLs

Use these three URLs for testing the current multi-tenant flow:

### 1. Super Admin
- URL: https://muhammedayaz77.github.io/HindPharma/View/super-admin.html
- Username: `Muhammed`
- Password: `Muhammed@123`

### 2. Hind Pharma — Admin
- Shop Home: https://muhammedayaz77.github.io/HindPharma/View/index.html?shop=hind-pharma
- Login: https://muhammedayaz77.github.io/HindPharma/View/login.html?shop=hind-pharma
- Username: `Ayaz`
- Password: `Ayaz@123`

### 3. India Medical Agency — Admin
- Shop Home: https://muhammedayaz77.github.io/HindPharma/View/index.html?shop=india-medical-agency
- Login: https://muhammedayaz77.github.io/HindPharma/View/login.html?shop=india-medical-agency
- Username: `riyaz`
- Password: `riyaz@123`

## Hind Pharma employees

- Aman — `aman` / `aman@123`
- Rafe — `rafe` / `rafe@123`
- Furkhan — `furkhan` / `furkhan@123`

## Final order flow

`Home → Medical List → Select Medical → Product List → Select Products → Final Order → Submit Order`

This flow is the same for Admin, Manager and Employee.

## Daily Calling flow

`Home → Daily Calling → Today's Medicals → Medical Name + Mobile → Tap Mobile → Call → isCall automatically recorded → Picked / Not Picked`

`isCall` is system-generated. Employee cannot manually mark a call as completed.

## Role rule

- **Admin:** Manager + Employee work, plus Admin work.
- **Manager:** Employee work, plus Manager work.
- **Employee:** Employee work only.
- **Super Admin:** Separate system/tenant dashboard.

## Multi-tenant model

Each shop is represented by a tenant slug and uses the same Home UI. No separate HTML file is created for each shop.

Example shop route concept:

`/shop/hind-pharma`

`/shop/india-medical-agency`

The production backend uses SQLite for persistent tenant, user, product, medical, order and calling data.
