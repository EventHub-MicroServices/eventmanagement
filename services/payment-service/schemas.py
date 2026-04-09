from pydantic import BaseModel
from typing import Optional, List

class PaymentCreate(BaseModel):
    booking_id: int
    amount: float
    payment_method: str

class PaymentOut(BaseModel):
    id: int
    booking_id: int
    amount: float
    status: str
    transaction_id: str
    warnings: Optional[List[str]] = []
    
    class Config:
        from_attributes = True
