from pydantic import BaseModel
from typing import Optional, List

class BookingCreate(BaseModel):
    user_id: int
    event_id: int
    quantity: int = 1
    attendee_name: str
    email: str
    
class BookingOut(BaseModel):
    id: int
    user_id: int
    event_id: int
    status: str
    amount: float
    quantity: int
    attendee_name: str
    email: str
    warnings: Optional[List[str]] = []
    
    class Config:
        from_attributes = True
