from database import Base
from sqlalchemy import Column, Integer, String, Float

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, index=True)
    amount = Column(Float)
    status = Column(String, default="SUCCESS")
    transaction_id = Column(String)
