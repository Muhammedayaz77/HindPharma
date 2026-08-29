from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from Helper.auth import create_token, verify_token
from Helper.password import hash_password, verify_password
from Models.productModel import ProductModel
from Models.medicalNameModel import MedicalNameModel
from Models.userModel import UserModel

app = FastAPI(title='Hind Pharma API', version='1.1.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])
bearer = HTTPBearer(auto_error=False)


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail='Authentication required')
    try:
        return verify_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=401, detail='Invalid or expired session')


def admin_user(user=Depends(current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return user


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/products')
def products(search: str = Query(default=''), limit: int = 100, offset: int = 0):
    limit = max(1, min(limit, 500))
    offset = max(0, offset)
    rows = ProductModel.search(search, limit) if search.strip() else ProductModel.get_all(limit, offset)
    return rows


@app.get('/medical-names')
def medical_names():
    return MedicalNameModel.get_all()


@app.post('/login')
def login(payload: dict):
    username = str(payload.get('username', '')).strip()
    password = str(payload.get('password', ''))
    user = UserModel.find_by_username(username)
    if not user or not user['is_active'] or not verify_password(password, user['password_hash']):
        raise HTTPException(status_code=401, detail='Invalid username or password')
    token = create_token(user['id'], user['username'], user['role'])
    return {'id': user['id'], 'username': user['username'], 'role': user['role'], 'token': token}


@app.get('/admin/users')
def admin_users(_user=Depends(admin_user)):
    return UserModel.get_all()


@app.post('/admin/users')
def create_user(payload: dict, _user=Depends(admin_user)):
    username = str(payload.get('username', '')).strip()
    password = str(payload.get('password', ''))
    role = str(payload.get('role', 'user')).strip().lower()
    if not username or not password:
        raise HTTPException(status_code=400, detail='Username and password are required')
    if role not in {'admin', 'user'}:
        raise HTTPException(status_code=400, detail='Role must be admin or user')
    if len(password) < 8:
        raise HTTPException(status_code=400, detail='Password must be at least 8 characters')
    try:
        return UserModel.create(username, hash_password(password), role)
    except Exception as error:
        if 'duplicate key' in str(error).lower() or 'unique' in str(error).lower():
            raise HTTPException(status_code=409, detail='Username already exists')
        raise


@app.post('/admin/medical-names')
def create_medical(payload: dict, _user=Depends(admin_user)):
    name = str(payload.get('name', '')).strip()
    area = str(payload.get('area', '')).strip()
    if not name:
        raise HTTPException(status_code=400, detail='Medical name is required')
    try:
        return MedicalNameModel.create(name, area)
    except Exception as error:
        if 'duplicate key' in str(error).lower() or 'unique' in str(error).lower():
            raise HTTPException(status_code=409, detail='Medical already exists')
        raise


@app.post('/admin/products')
def create_product(payload: dict, _user=Depends(admin_user)):
    name = str(payload.get('name', '')).strip()
    if not name:
        raise HTTPException(status_code=400, detail='Product name is required')
    try:
        mrp_value = payload.get('mrp')
        mrp = float(mrp_value) if mrp_value not in (None, '') else None
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail='MRP must be a valid number')
    product_id = str(payload.get('id', '')).strip() or f'ADM-{uuid4().hex[:12].upper()}'
    try:
        return ProductModel.create(
            product_id,
            str(payload.get('code', '')).strip(),
            name,
            str(payload.get('unit', '')).strip(),
            mrp,
            str(payload.get('formula', '')).strip(),
            str(payload.get('company', '')).strip(),
        )
    except Exception as error:
        if 'duplicate key' in str(error).lower() or 'unique' in str(error).lower():
            raise HTTPException(status_code=409, detail='Product ID already exists')
        raise
