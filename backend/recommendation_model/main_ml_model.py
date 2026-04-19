import os, pandas as pd, numpy as np

#Import all ML training methods from other modules
from .load_data import load_data
from .process_data import process_data
from .Recommendation1 import collaborative_recommender
from .Reccomendation2 import association_recommender
from .Recommendation3 import content_based_recommender
from .Recommendation4 import popularity_fallback_recommender

""" Start of the main ML Model """

def main_recommendation_model(user_id: int):
    ratings, anime, users, locations, genres, seasons = load_data()
    
    # Preprocess the data
    if all([df is not None for df in [ratings, anime, users, locations, genres, seasons]]):
        merged_df, processed_anime_df, processed_users_df, processed_genres_df, processed_seasons_df = process_data(ratings, anime, users, locations, genres, seasons)
    else:
        return {"primary": [], "contextual": [], "discovery": []}
    
    # Check interaction count for cold-start detection
    user_ratings_count = ratings[ratings['userId'] == user_id].shape[0]
    is_cold_start = user_ratings_count < 5

    # Generate various recommendation types
    recom1 = collaborative_recommender(user_id, ratings, processed_anime_df, 10)
    recom2 = association_recommender(user_id, processed_users_df, processed_anime_df, 10)
    recom3 = content_based_recommender(user_id, ratings, processed_anime_df, 10)
    recom4 = popularity_fallback_recommender(user_id, merged_df, processed_anime_df, processed_users_df, 10)

    # Hybrid blending with categorized labeling
    if is_cold_start:
        return {
            "primary": recom4,       # Regional/Global Trends
            "contextual": recom3,    # Content-based (if any history)
            "discovery": recom1      # Collaborative (fallback)
        }
    
    return {
        "primary": recom1,       # Personalized Collaborative
        "contextual": recom2,    # People also watched (Association)
        "discovery": recom3      # Genre similarity (Content-based)
    }
