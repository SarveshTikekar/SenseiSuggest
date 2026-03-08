import django
import pandas as pd
import os
import sys 
from supabase import create_client, Client
from dotenv import load_dotenv

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def load_data():
    if not supabase:
        raise ValueError("Supabase client not initialized")
        
    try:
        # Fetch data via Supabase REST API and convert to DataFrames
        ratings_resp = supabase.table("ratings").select("*").execute()
        Ratings = pd.DataFrame(ratings_resp.data) if ratings_resp.data else pd.DataFrame()
        
        anime_resp = supabase.table("anime").select("*").execute()
        Anime = pd.DataFrame(anime_resp.data) if anime_resp.data else pd.DataFrame()
        
        users_resp = supabase.table("users").select("*").execute()
        Users = pd.DataFrame(users_resp.data) if users_resp.data else pd.DataFrame()
        
        loc_resp = supabase.table("locations").select("*").execute()
        Locations = pd.DataFrame(loc_resp.data) if loc_resp.data else pd.DataFrame()
        
        genres_resp = supabase.table("genres").select("*").execute()
        Genres = pd.DataFrame(genres_resp.data) if genres_resp.data else pd.DataFrame()
        
        seasons_resp = supabase.table("seasons").select("*").execute()
        Seasons = pd.DataFrame(seasons_resp.data) if seasons_resp.data else pd.DataFrame()
        
        return Ratings, Anime, Users, Locations, Genres, Seasons
    
    except Exception as e:
        raise ValueError(f"{e}")
        return None, None, None, None, None, None