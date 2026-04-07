from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="admin-service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.status_code, "message": exc.detail}},
    )

BOOKING_SERVICE_URL = os.getenv("BOOKING_SERVICE_URL", "http://localhost:8003")
EVENTS_SERVICE_URL = os.getenv("EVENTS_SERVICE_URL", "http://localhost:8002")

@app.get("/")
def read_root():
    return {"service": "admin-service", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/seed-data")
def seed_data(payload: Dict):
    try:
        user_id = payload.get("user_id", 1)
        # 1. Create a dummy event
        ev_data = {
            "title": "Grand Tech Conference 2026",
            "description": "A massive event for tech enthusiasts.",
            "date": "2026-06-15",
            "capacity": 100,
            "price": 50.0,
            "location": "San Francisco, CA",
            "organizer_id": user_id
        }
        ev_res = requests.post(f"{EVENTS_SERVICE_URL}/events", json=ev_data)
        event = ev_res.json()
        
        # 2. Create a booking
        bk_data = {
            "user_id": user_id,
            "event_id": event["id"],
            "quantity": 2,
            "attendee_name": "Test Attendee",
            "email": "test@example.com"
        }
        bk_res = requests.post(f"{BOOKING_SERVICE_URL}/bookings", json=bk_data)
        booking = bk_res.json()
        
        # 3. Pay for it
        requests.put(f"{BOOKING_SERVICE_URL}/bookings/{booking['id']}/pay")
        
        return {"message": "Sample data seeded successfully!", "event_id": event["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
def get_analytics():
    events = []
    bookings = []
    status = {"events": "ok", "bookings": "ok"}
    
    try:
        events_res = requests.get(f"{EVENTS_SERVICE_URL}/events", timeout=5)
        events = events_res.json() if events_res.status_code == 200 else []
        if events_res.status_code != 200: status["events"] = "error"
    except Exception as e:
        print(f"Events fetch error: {e}")
        status["events"] = "unreachable"

    try:
        bookings_res = requests.get(f"{BOOKING_SERVICE_URL}/bookings", timeout=5)
        bookings = bookings_res.json() if bookings_res.status_code == 200 else []
        if bookings_res.status_code != 200: status["bookings"] = "error"
    except Exception as e:
        print(f"Bookings fetch error: {e}")
        status["bookings"] = "unreachable"

    paid_bookings = [b for b in bookings if b.get("status") == "PAID"]
    total_tickets_sold = sum(b.get("quantity", 0) for b in paid_bookings)
    total_revenue = sum(b.get("amount", 0.0) for b in paid_bookings)
    total_profit = total_revenue * 0.10

    return {
        "total_events": len(events),
        "total_tickets_sold": total_tickets_sold,
        "total_revenue": total_revenue,
        "total_profit": total_profit,
        "bookings_count": len(bookings),
        "paid_bookings_count": len(paid_bookings),
        "service_status": status
    }
