import asyncio
from supabase import create_client, AsyncClient
import os
from dotenv import load_dotenv

load_dotenv("/home/sarvesh/SenseiSuggest/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

resp = supabase.table("anime_scrapbook").select("screenshotUrl").limit(1).execute()
print(resp.data)
