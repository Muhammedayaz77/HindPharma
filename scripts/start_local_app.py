from pathlib import Path
import subprocess
import sys
import time
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / 'Backend'

subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(BACKEND / 'requirements.txt')], check=True)
process = subprocess.Popen([sys.executable, str(BACKEND / 'start_local.py')], cwd=BACKEND)
try:
    time.sleep(2)
    webbrowser.open('http://127.0.0.1:8000/docs')
    process.wait()
except KeyboardInterrupt:
    process.terminate()
    process.wait()
