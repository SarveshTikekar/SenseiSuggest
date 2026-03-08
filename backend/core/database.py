import os
from dotenv import load_dotenv
from supabase import create_async_client, AsyncClient

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL and SUPABASE_KEY must be set in .env")

# Supabase AsyncClient
async def get_supabase() -> AsyncClient:
    return await create_async_client(SUPABASE_URL, SUPABASE_KEY)

