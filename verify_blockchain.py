import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"
BLOCKS_URL = f"{BASE_URL}/blockchain/blocks"
VERIFY_URL = f"{BASE_URL}/blockchain/verify"
ANALYZE_URL = f"{BASE_URL}/blockchain/analyze"

def login():
    response = requests.post(LOGIN_URL, data={"username": "admin", "password": "adminpassword"})
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.text}")
        return None

def test_blockchain():
    token = login()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}

    print("\n1. Fetching Blocks...")
    response = requests.get(BLOCKS_URL, headers=headers)
    if response.status_code == 200:
        blocks = response.json()
        print(f"Success! Retrieved {len(blocks)} blocks.")
        for block in blocks:
            print(f" - Block {block['id']}: {block['action']} (Hash: {block['hash'][:10]}...)")
    else:
        print(f"Failed to fetch blocks: {response.text}")

    print("\n2. Verifying Chain Integrity...")
    response = requests.post(VERIFY_URL, headers=headers)
    if response.status_code == 200:
        status = response.json()
        print(f"Verification Result: {status['message']}")
        print(f"Valid: {status['isValid']}")
    else:
        print(f"Failed to verify chain: {response.text}")

    print("\n3. Analyzing Chain (AI)...")
    # This might fail if no API key, but we check the endpoint exists
    response = requests.post(ANALYZE_URL, headers=headers, params={"query": "Is everything okay?"})
    if response.status_code == 200:
        analysis = response.json()
        print(f"AI Analysis: {analysis['analysis'][:100]}...")
    else:
        print(f"AI Analysis failed (expected if no key): {response.text}")

if __name__ == "__main__":
    # Wait for server to start
    time.sleep(2)
    test_blockchain()
