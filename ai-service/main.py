from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
import requests
import urllib.parse

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="ai-service")

class EventGenerationRequest(BaseModel):
    keywords: str

class EventGenerationResponse(BaseModel):
    title: str
    description: str
    capacity: int
    image_url: Optional[str] = None

# Initialize Gemini
api_key = os.getenv("GOOGLE_API_KEY")
llm = None

if not api_key:
    logger.warning("GOOGLE_API_KEY not found. AI service will run in MOCK mode.")
else:
    try:
        model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        logger.info(f"Initializing Gemini with model {model_name}...")
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key)
        logger.info("Gemini initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        # We don't exit here so the healthcheck can still pass and return an error later

parser = PydanticOutputParser(pydantic_object=EventGenerationResponse)

prompt = ChatPromptTemplate.from_template(
    "You are an expert event planner. Given the following keywords, generate a high-quality event plan.\n"
    "Keywords: {keywords}\n\n"
    "{format_instructions}\n"
    "Important: Include a relevant, existing, and high-quality image URL (e.g. from Unsplash or other public sources) that matches the event theme in the image_url field.\n"
    "Make the description engaging and professional. Suggest a realistic capacity based on the theme."
)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "ai-service"}

@app.post("/generate", response_model=EventGenerationResponse)
async def generate_event(request: EventGenerationRequest):
    if not llm:
        # Mock response if Gemini is not configured
        return EventGenerationResponse(
            title=f"Sample Event: {request.keywords}",
            description="This is a mock description because GOOGLE_API_KEY is not set.",
            capacity=100,
            image_url=f"https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000"
        )

    try:
        logger.info(f"Generating event for keywords: {request.keywords}")
        # 1. Generate Content with LangChain
        chain = prompt | llm | parser
        result = chain.invoke({
            "keywords": request.keywords, 
            "format_instructions": parser.get_format_instructions()
        })
        logger.info(f"Success! Generated: {result.title}")
        
        return result
    except Exception as e:
        logger.error(f"Error in generate_event: {str(e)}")
        # If it's a parsing error, try to extract JSON manually?
        # For now, let's just make sure we return the direct error to the frontend if possible
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)
