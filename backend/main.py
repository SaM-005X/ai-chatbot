import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel


# Load environment variables from .env
load_dotenv()

# Get the Gemini API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY was not found")


# Create Gemini client
client = genai.Client(api_key=api_key)


# Create FastAPI application
app = FastAPI(title="AI Chatbot API")


# Allow requests from our React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {"message": "AI Chatbot backend is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/chat")
def chat(request: ChatRequest):
    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=request.message,
            )

            return {
                "response": response.text
            }

        except Exception as error:
            if attempt == max_attempts - 1:
                print(f"Gemini request failed: {error}")

                return {
                    "response": "Gemini is temporarily unavailable. Please try again in a moment."
                }

            time.sleep(2)