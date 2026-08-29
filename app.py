from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from Helper.password import verify_password
from Models.productModel import ProductModel
from Models.medicalNameModel import MedicalNameModel
from Models.userModel import UserModel

app = FastAPI(title='Hind Pharma API', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])

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
    return {'id': user['id'], 'username': user['username']}
