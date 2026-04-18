import asyncio
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv("/home/sarvesh/SenseiSuggest/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

bucket = supabase.storage.get_bucket("anime_scrapbook")
print("Public:", bucket.public)
