import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load from ai-service/.env as requested previously
dotenv_path = os.path.join('ai-service', '.env')
load_dotenv(dotenv_path)

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Error: GOOGLE_API_KEY not found in ai-service/.env")
    exit(1)

genai.configure(api_key=api_key)

print(f"Listing models for API Key: {api_key[:10]}...")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name} (Display: {m.display_name})")
except Exception as e:
    print(f"Error listing models: {e}")
