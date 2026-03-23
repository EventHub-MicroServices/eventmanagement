from fastapi import FastAPI, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from models import Booking
from schemas import BookingCreate, BookingOut
import os
import requests
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="booking-service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"service": "booking-service", "status": "running"}

EVENTS_SERVICE_URL = os.getenv("EVENTS_SERVICE_URL", "http://localhost:8002")

@app.post("/bookings", response_model=BookingOut)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    try:
        response = requests.get(f"{EVENTS_SERVICE_URL}/events/{booking.event_id}")
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Event not found")
        event_data = response.json()
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Events service unavailable")
        
    if event_data.get("capacity", 0) < booking.quantity:
        raise HTTPException(status_code=400, detail="Not enough tickets available")
        
    try:
        cap_response = requests.put(f"{EVENTS_SERVICE_URL}/events/{booking.event_id}/capacity?amount={booking.quantity}")
        if cap_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to reduce capacity")
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Events service unavailable")

    new_booking = Booking(
        user_id=booking.user_id,
        event_id=booking.event_id,
        status="PENDING",
        amount=event_data.get("price", 0.0) * booking.quantity,
        quantity=booking.quantity
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@app.get("/bookings/user/{user_id}", response_model=List[BookingOut])
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.user_id == user_id).all()

@app.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@app.put("/bookings/{booking_id}/pay", response_model=BookingOut)
def pay_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "PAID"
    db.commit()
    db.refresh(booking)
    return booking
