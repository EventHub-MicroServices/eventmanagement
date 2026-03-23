from database import Base
from sqlalchemy import Column, Integer, String, Float

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    event_id = Column(Integer, index=True)
    status = Column(String, default="PENDING")
    amount = Column(Float)
    quantity = Column(Integer, default=1)
