"""Hind Pharma SQLite API entry point."""
from Backend.main import app
from Backend.tenant_routes import register as register_tenant_routes

register_tenant_routes(app)
__all__ = ['app']

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8000, reload=True)
