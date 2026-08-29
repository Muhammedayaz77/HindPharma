from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from Helper.password import verify_password
from Models.productModel import ProductModel
from Models.medicalNameModel import MedicalNameModel
from Models.userModel import UserModel

app = FastAPI(title="Hind Pharma API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/products")
def products(search: str = Query(default=""), limit: int = 100, offset: int = 0):
    rows = ProductModel.search(search, limit) if search else ProductModel.get_all(limit, offset)
    return [dict(row) for row in rows]

@app.get("/medical-names")
def medical_names():
    return [dict(row) for row in MedicalNameModel.get_all()]

@app.post("/login")
def login(payload: dict):
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    user = UserModel.find_by_username(username)
    if not user or not user[3] or not verify_password(password, user[2]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"id": user[0], "username": user[1]}
