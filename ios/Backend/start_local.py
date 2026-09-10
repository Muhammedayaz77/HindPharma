from pathlib import Path
import subprocess
import sys

BACKEND_DIR = Path(__file__).resolve().parent

subprocess.run([sys.executable, str(BACKEND_DIR / 'database.py')], check=True)
subprocess.run([sys.executable, str(BACKEND_DIR / 'migrate_json_to_sqlite.py')], check=True)
subprocess.run([sys.executable, '-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'], cwd=BACKEND_DIR, check=True)
