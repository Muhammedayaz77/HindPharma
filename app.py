"""Compatibility entry point for the Hind Pharma SQLite API.

The application implementation lives in Backend/main.py. Keeping this small
entry point preserves existing local launch commands without maintaining a
second API implementation.
"""

from Backend.main import app

__all__ = ['app']


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8000, reload=True)
