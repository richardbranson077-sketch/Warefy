import requests
import sys
import os

def check_health(url="http://localhost:8000"):
    """Check the health of the Warefy API"""
    print(f"🏥 Checking health of Warefy API at {url}...")
    
    try:
        response = requests.get(f"{url}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ API is healthy!")
            print(f"   Status: {data.get('status')}")
            print(f"   Database: {data.get('database')}")
            print(f"   ML Pipelines: {data.get('ml_pipelines')}")
            return True
        else:
            print(f"❌ API returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Error checking health: {e}")
        return False

if __name__ == "__main__":
    # Get URL from args or env or default
    url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("API_URL", "http://localhost:8000")
    success = check_health(url)
    sys.exit(0 if success else 1)
