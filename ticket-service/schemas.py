from pydantic import BaseModel

class TicketCreate(BaseModel):
    user_id: int
    booking_id: int

class TicketOut(BaseModel):
    id: int
    user_id: int
    booking_id: int
    ticket_code: str
    
    class Config:
        from_attributes = True
