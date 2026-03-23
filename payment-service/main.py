from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from models import Payment
from schemas import PaymentCreate, PaymentOut
import os
import requests
import uuid
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="payment-service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"service": "payment-service", "status": "running"}

BOOKING_SERVICE_URL = os.getenv("BOOKING_SERVICE_URL", "http://localhost:8003")
TICKET_SERVICE_URL = os.getenv("TICKET_SERVICE_URL", "http://localhost:8005")

@app.post("/pay", response_model=PaymentOut)
def process_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    transaction_id = str(uuid.uuid4())
    
    new_payment = Payment(
        booking_id=payment.booking_id,
        amount=payment.amount,
        status="SUCCESS",
        transaction_id=transaction_id
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    # Fetch booking to get user_id
    try:
        booking_resp = requests.get(f"{BOOKING_SERVICE_URL}/bookings/{payment.booking_id}")
        user_id = booking_resp.json().get("user_id") if booking_resp.status_code == 200 else None
    except requests.RequestException:
        user_id = None

    try:
        requests.put(f"{BOOKING_SERVICE_URL}/bookings/{payment.booking_id}/pay")
    except requests.RequestException as e:
        print(f"Failed to update booking status: {e}")
        
    try:
        if user_id:
            requests.post(f"{TICKET_SERVICE_URL}/tickets", json={"booking_id": payment.booking_id, "user_id": user_id})
    except requests.RequestException as e:
        print(f"Failed to trigger ticket generation: {e}")

    return new_payment
