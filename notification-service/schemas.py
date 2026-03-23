from pydantic import BaseModel

class NotificationCreate(BaseModel):
    recipient: str
    message: str

class NotificationOut(BaseModel):
    id: int
    recipient: str
    message: str
    status: str
    
    class Config:
        from_attributes = True
