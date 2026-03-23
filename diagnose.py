import requests

services = [
    ("Users", "http://localhost:8001/"),
    ("Events", "http://localhost:8002/events"),
    ("Booking", "http://localhost:8003/"),
    ("Payment", "http://localhost:8004/"),
    ("Ticket", "http://localhost:8005/"),
    ("Notification", "http://localhost:8006/"),
]

def check():
    print("Checking backend services reachability from your host...")
    for name, url in services:
        try:
            res = requests.get(url, timeout=2)
            print(f"[OK] {name} service is reachable at {url} (Status: {res.status_code})")
        except Exception as e:
            print(f"[ERROR] {name} service is NOT reachable at {url}. Cause: {e}")

if __name__ == "__main__":
    check()
