import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Add backend directory to path so we can import VitalRecord
sys.path.append(os.path.abspath("../backend"))
from database import VitalRecord

load_dotenv(dotenv_path="../backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    res = client.table("patients").select("*").execute()
    if res.data:
        for p in res.data:
            try:
                vh_history = [VitalRecord(**vh) for vhint, vh in enumerate(p["vitals_history"]) if vh]
            except Exception as e:
                print(f"Patient {p.get('id')} failed: {e}")
                print("Raw vitals_history:", p.get("vitals_history"))
        print("Check complete.")
    else:
        print("No patient data found.")
else:
    print("Supabase credentials not found.")
