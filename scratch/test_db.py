import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path="../backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    res = client.table("patients").select("*").execute()
    if res.data:
        for p in res.data:
            vh = p.get("vitals_history")
            if vh:
                for idx, item in enumerate(vh):
                    if not isinstance(item, dict):
                        print(f"Patient {p.get('id')} has non-dict item at index {idx}: type={type(item)}, value={item}")
        print("Scan complete.")
    else:
        print("No patient data found in Supabase.")
else:
    print("Supabase credentials not found.")
