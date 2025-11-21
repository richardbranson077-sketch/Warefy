#!/bin/bash
echo "Installing dependencies..."
pip3 install uvicorn fastapi sqlalchemy pydantic python-multipart pyotp qrcode authlib httpx openai

echo "Starting Warefy Backend..."
python3 -m uvicorn backend.main_lite:app --reload --port 8000
