from dataclasses import dataclass
from typing import Optional

@dataclass
class UserModel:
    id: Optional[int]
    username: str
    role: str
    is_active: bool = True

@dataclass
class MedicalModel:
    id: Optional[int]
    name: str
    area: Optional[str] = None

@dataclass
class ProductModel:
    id: Optional[int]
    product_id: Optional[str]
    code: Optional[str]
    name: str
    unit: Optional[str] = None
    mrp: Optional[float] = None
    formula: Optional[str] = None
    company: Optional[str] = None
    image: Optional[str] = None

@dataclass
class OrderItemModel:
    id: Optional[int]
    order_id: int
    product_id: int
    quantity: int

@dataclass
class OrderModel:
    id: Optional[int]
    medical_id: Optional[int]
    created_by: int
    status: str = 'pending'
