from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BACKEND = Path(__file__).resolve().parent

print('Hind Pharma local backend')
print('1. Initializing database...')
subprocess.run([sys.executable, '-c', 'from database import initialize_database; initialize_database()'], cwd=BACKEND, check=True)
print('2. Migrating JSON backup into SQLite...')
subprocess.run([sys.executable, 'migrate_json_to_sqlite.py'], cwd=BACKEND, check=True)
print('3. Starting local API at http://127.0.0.1:8000')
subprocess.run([sys.executable, '-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'], cwd=BACKEND, check=True)
