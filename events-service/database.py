from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    m_user = os.getenv("MONGO_USER")
    m_pass = os.getenv("MONGO_PASSWORD")
    m_host = os.getenv("MONGO_HOST", "localhost")
    m_port = os.getenv("MONGO_PORT", "27017")
    if m_user and m_pass:
        MONGO_URI = f"mongodb://{m_user}:{m_pass}@{m_host}:{m_port}/"
    else:
        MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['events_db']
collection = db['events']
def get_db():
    # Return the collection directly for simplicity
    return collection
