# Hind Pharma local backend

The local development architecture is:

View → ViewModel → Temp API → Local FastAPI → SQLite

## Start

From the repository root:

```bash
python Backend/start_local.py
```

The API runs at `http://127.0.0.1:8000`.

The starter initializes the SQLite database and migrates the JSON backup data before starting FastAPI.

## Important

- `data/*.json` files are kept as backups and are not deleted.
- The SQLite database is generated locally as `Backend/hind_pharma.db`.
- The local API is intended for development only until a real hosted API is introduced.
- GitHub Pages cannot run the Python backend; use the local backend with a local frontend server for DB-backed testing.
