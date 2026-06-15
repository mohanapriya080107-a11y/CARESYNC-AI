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
            vitals = p.get("vitals")
            if not isinstance(vitals, dict):
                print(f"Patient {p.get('id')} has non-dict vitals: type={type(vitals)}, value={vitals}")
        print("Vitals scan complete.")
    else:
        print("No patient data found.")
else:
    print("Supabase credentials not found.")
