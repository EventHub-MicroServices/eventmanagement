from database import SessionLocal
from models import User

def make_admin():
    db = SessionLocal()
    # Get the very first user who registered
    user = db.query(User).first()
    
    if user:
        user.role = 'admin'
        db.commit()
        print(f"\n=========================================")
        print(f"SUCCESS! Upgraded user '{user.username}' to ADMIN.")
        print(f"=========================================\n")
    else:
        print("\nERROR: No users found in the database. Please register an account first!\n")
        
if __name__ == "__main__":
    make_admin()
