import requests

BASE_URL = "http://localhost:8000/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"
VERIFY_URL = f"{BASE_URL}/blockchain/verify"

# Login with correct credentials
response = requests.post(LOGIN_URL, data={"username": "admin", "password": "admin123"})
if response.status_code == 200:
    token = response.json()["access_token"]
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    # Test verify endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(VERIFY_URL, headers=headers)
    
    print(f"\n📊 Verify Response Status: {response.status_code}")
    print(f"📊 Verify Response Body:")
    print(response.json())
else:
    print(f"❌ Login failed: {response.text}")
