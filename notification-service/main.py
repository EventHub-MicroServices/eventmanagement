from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from models import NotificationLog
from schemas import NotificationCreate, NotificationOut
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="notification-service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"service": "notification-service", "status": "running"}

@app.post("/notify", response_model=NotificationOut)
def send_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    logging.info(f"Sending notification to {notification.recipient}: {notification.message}")
    
    new_log = NotificationLog(
        recipient=notification.recipient,
        message=notification.message,
        status="SENT"
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
