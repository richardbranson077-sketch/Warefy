"""
Computer Vision Router - Image analysis and object detection using Gemini Vision
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
import google.generativeai as genai
from datetime import datetime
import json
from PIL import Image
import io

from backend.database_lite import get_db
from backend.models_lite import User
from backend.auth_lite import get_current_active_user

router = APIRouter(tags=["Computer Vision"])

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Analyze uploaded image using Gemini Vision to detect warehouse items, safety issues, etc.
    """
    print(f"=== Vision Analysis Request ===")
    print(f"File: {file.filename}, Content-Type: {file.content_type}, Size: {file.size if hasattr(file, 'size') else 'unknown'}")
    print(f"User: {current_user.username}")
    
    if not api_key:
        print("ERROR: Gemini API key not configured")
        return {
            "error": "Gemini API key not configured",
            "detected_objects": [],
            "analysis": "AI service unavailable"
        }

    try:
        # Read image file
        contents = await file.read()
        print(f"Read {len(contents)} bytes from uploaded file")
        
        image = Image.open(io.BytesIO(contents))
        print(f"Image opened successfully: {image.format}, {image.size}")
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Analyze this warehouse/supply chain image. 
        Identify:
        1. Key objects (pallets, boxes, forklifts, people)
        2. Potential safety hazards (blocked paths, unsafe stacking)
        3. Inventory estimate (approximate count of visible items)
        4. Condition assessment (damaged goods, clean floor)
        
        Return the response as a JSON object with these keys:
        - objects: list of strings
        - hazards: list of strings
        - inventory_count: string (e.g. "approx 50 boxes")
        - condition: string
        - summary: string (brief description)
        
        Do not use markdown formatting. Just raw JSON.
        """
        
        print("Sending to Gemini Vision...")
        response = model.generate_content([prompt, image])
        text = response.text.strip()
        print(f"Gemini response length: {len(text)} chars")
        
        # Clean up markdown if present
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        try:
            analysis_result = json.loads(text)
            print("JSON parsed successfully")
        except json.JSONDecodeError as je:
            print(f"JSON parse error: {je}")
            # Fallback if JSON parsing fails
            analysis_result = {
                "objects": [],
                "hazards": [],
                "inventory_count": "Unknown",
                "condition": "Unknown",
                "summary": text
            }
            
        result = {
            "status": "success",
            "filename": file.filename,
            "processed_at": datetime.now().isoformat(),
            "result": analysis_result
        }
        print(f"Returning result: {result}")
        return result
        
    except Exception as e:
        print(f"ERROR in analyze_image: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_vision_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get history of analyzed images (Mock for now as we don't store images yet)"""
    return [
        {
            "id": 1,
            "filename": "warehouse_zone_a.jpg",
            "processed_at": datetime.now().isoformat(),
            "summary": "Detected 15 pallets and 1 forklift. No safety hazards found."
        },
        {
            "id": 2,
            "filename": "loading_dock_02.jpg",
            "processed_at": datetime.now().isoformat(),
            "summary": "Detected blocked emergency exit. Hazard alert generated."
        }
    ]
