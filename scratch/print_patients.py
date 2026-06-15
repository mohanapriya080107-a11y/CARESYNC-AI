import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path="../backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    res = client.table("patients").select("id, name, vitals").execute()
    if res.data:
        print(f"Total patients in Supabase: {len(res.data)}")
        for p in res.data:
            v = p.get("vitals")
            print(f"ID: {p.get('id')}, Name: {p.get('name')}, Vitals Type: {type(v)}")
    else:
        print("No patient data found.")
else:
    print("Supabase credentials not found.")
