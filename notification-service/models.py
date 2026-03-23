from database import Base
from sqlalchemy import Column, Integer, String

class NotificationLog(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    recipient = Column(String)
    message = Column(String)
    status = Column(String, default="SENT")
