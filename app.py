"""Hind Pharma SQLite API entry point."""
from Backend import main as main_module
from Backend.main import app
from Backend.tenant_routes import register as register_tenant_routes

_original_require = main_module._require

def _require_with_calling_roles(principal, *roles):
    # Daily Calling is common shop work for Employee, Manager and Admin.
    if roles == ('employee',):
        return _original_require(principal, 'admin', 'manager', 'employee')
    return _original_require(principal, *roles)

main_module._require = _require_with_calling_roles
register_tenant_routes(app)
__all__ = ['app']

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8000, reload=True)
