from database import Base
from sqlalchemy import Column, Integer, String

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    booking_id = Column(Integer, index=True)
    ticket_code = Column(String, unique=True)
