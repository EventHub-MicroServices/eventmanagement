from pydantic import BaseModel

class BookingCreate(BaseModel):
    user_id: int
    event_id: int
    quantity: int = 1
    
class BookingOut(BaseModel):
    id: int
    user_id: int
    event_id: int
    status: str
    amount: float
    quantity: int
    
    class Config:
        from_attributes = True
