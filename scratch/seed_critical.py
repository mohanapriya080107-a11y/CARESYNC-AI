import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.abspath("../backend"))
from database import db

print("Forcing database re-initialization and seeding...")
db.initialize_doctors()
db.initialize_patients()
db.sync_to_supabase()
print("Database successfully re-seeded with new patients (including critical cases).")
