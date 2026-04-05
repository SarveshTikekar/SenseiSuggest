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
        
        # 1. Fetch and Aggregate Anime Genres (Many-to-Many)
        if not Anime.empty:
            ag_resp = supabase.table("anime_genres").select("animeId, genreId").execute()
            if ag_resp.data:
                ag_df = pd.DataFrame(ag_resp.data)
                # Group genre IDs by anime ID
                genres_grouped = ag_df.groupby('animeId')['genreId'].apply(list).reset_index()
                genres_grouped.columns = ['animeId', 'genres']
                Anime = pd.merge(Anime, genres_grouped, on='animeId', how='left')
                # Fill missing genres with empty lists
                Anime['genres'] = Anime['genres'].apply(lambda x: x if isinstance(x, list) else [])
            else:
                Anime['genres'] = [[] for _ in range(len(Anime))]

        users_resp = supabase.table("users").select("*").execute()
        Users = pd.DataFrame(users_resp.data) if users_resp.data else pd.DataFrame()

        # 2. Fetch and Aggregate User History (Many-to-Many)
        if not Users.empty:
            # Watched history
            uwa_resp = supabase.table("user_watched_anime").select("userId, animeId").execute()
            if uwa_resp.data:
                uwa_df = pd.DataFrame(uwa_resp.data)
                uwa_grouped = uwa_df.groupby('userId')['animeId'].apply(list).reset_index()
                uwa_grouped.columns = ['userId', 'watchedAnime']
                Users = pd.merge(Users, uwa_grouped, on='userId', how='left')
                Users['watchedAnime'] = Users['watchedAnime'].apply(lambda x: x if isinstance(x, list) else [])
            else:
                Users['watchedAnime'] = [[] for _ in range(len(Users))]
            
            # Watching history
            uwi_resp = supabase.table("user_watching_anime").select("userId, animeId").execute()
            if uwi_resp.data:
                uwi_df = pd.DataFrame(uwi_resp.data)
                uwi_grouped = uwi_df.groupby('userId')['animeId'].apply(list).reset_index()
                uwi_grouped.columns = ['userId', 'watchingAnime']
                Users = pd.merge(Users, uwi_grouped, on='userId', how='left')
                Users['watchingAnime'] = Users['watchingAnime'].apply(lambda x: x if isinstance(x, list) else [])
            else:
                Users['watchingAnime'] = [[] for _ in range(len(Users))]
        
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