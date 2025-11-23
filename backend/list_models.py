import google.generativeai as genai
import os

api_key = "AIzaSyASyezy9BuFgygfLpv3aW2BUDQHz2Zw_iI"
genai.configure(api_key=api_key)

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
