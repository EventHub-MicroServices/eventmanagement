from pydantic import BaseModel

from typing import Optional

class EventBase(BaseModel):
    title: str
    description: str
    date: str
    capacity: int
    price: float
    image_url: Optional[str] = None
    organizer_id: Optional[int] = None

class EventCreate(EventBase):
    pass

class EventOut(EventBase):
    id: int
    
    class Config:
        from_attributes = True
