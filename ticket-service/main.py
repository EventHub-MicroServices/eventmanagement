from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from models import Ticket
from schemas import TicketCreate, TicketOut
import os
import requests
import uuid
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ticket-service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"service": "ticket-service", "status": "running"}

NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8006")

@app.post("/tickets", response_model=TicketOut)
def generate_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    ticket_code = f"TKT-{str(uuid.uuid4())[:8].upper()}"
    
    new_ticket = Ticket(
        user_id=ticket.user_id,
        booking_id=ticket.booking_id,
        ticket_code=ticket_code
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    try:
        requests.post(f"{NOTIFICATION_SERVICE_URL}/notify", json={
            "recipient": f"user_of_booking_{ticket.booking_id}@example.com",
            "message": f"Your ticket code is {ticket_code}"
        })
    except requests.RequestException as e:
        print(f"Failed to trigger notification: {e}")

    return new_ticket

@app.get("/tickets/user/{user_id}", response_model=List[TicketOut])
def get_user_tickets(user_id: int, db: Session = Depends(get_db)):
    return db.query(Ticket).filter(Ticket.user_id == user_id).all()

@app.get("/tickets/booking/{booking_id}", response_model=TicketOut)
def get_booking_ticket(booking_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.booking_id == booking_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
