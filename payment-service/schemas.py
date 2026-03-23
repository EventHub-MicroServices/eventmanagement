from pydantic import BaseModel

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
    
    class Config:
        from_attributes = True
