import requests

BASE_URL = "http://localhost:8000/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"
BLOCKS_URL = f"{BASE_URL}/blockchain/blocks"

# Login
response = requests.post(LOGIN_URL, data={"username": "admin", "password": "admin123"})
if response.status_code == 200:
    token = response.json()["access_token"]
    print(f"✅ Login successful!")
    
    # Test blocks endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(BLOCKS_URL, headers=headers)
    
    print(f"\n📊 Blocks Response Status: {response.status_code}")
    if response.status_code == 200:
        blocks = response.json()
        print(f"📊 Number of blocks: {len(blocks)}")
        for block in blocks[:3]:  # Show first 3
            print(f"  - Block {block['id']}: {block['action']}")
    else:
        print(f"❌ Error: {response.text}")
else:
    print(f"❌ Login failed: {response.text}")
