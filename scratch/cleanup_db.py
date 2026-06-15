import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path="../backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Deleting patient 101...")
    res = client.table("patients").delete().eq("id", "101").execute()
    print("Delete result:", res.data)
else:
    print("Supabase credentials not found.")
