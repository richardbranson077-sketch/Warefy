
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env vars
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("❌ No API Key found in environment")
    exit(1)

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("models/gemini-flash-latest")
    print("🤖 Attempting to generate content...")
    response = model.generate_content("Hello, are you working?")
    print(f"✅ Success! Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
