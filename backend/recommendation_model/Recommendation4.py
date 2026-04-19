""" Recommendation method 4: Regional & Global Popularity Fallback
This method addresses the Cold-Start problem for new users by providing:
1. Top trending anime in the user's State/Country (with privacy thresholds)
2. Recent high-rated releases
3. Global all-time favorites using Bayesian weighting
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def popularity_fallback_recommender(user_id, merged_df, anime_df, users_df, number_of_recommendations=10):
    print(f"Generating Regional & Popularity-based recommendations for User {user_id}")
    
    # 1. Identify User's Geographic Context
    user_record = users_df[users_df['userId'] == user_id]
    user_country = None
    user_state = None
    
    if not user_record.empty:
        user_country = user_record['country'].iloc[0] if 'country' in user_record.columns else None
        user_state = user_record['state'].iloc[0] if 'state' in user_record.columns else None

    # 2. Get anime the user has already interacted with
    user_watched = set()
    user_ratings = merged_df[merged_df['userId'] == user_id]
    if not user_ratings.empty:
        user_watched.update(user_ratings['animeId'].unique())
    
    # Also check watchedAnime list from users_df
    if not user_record.empty and 'watchedAnime' in user_record.columns:
        watched_list = user_record['watchedAnime'].iloc[0]
        if isinstance(watched_list, list):
            user_watched.update(watched_list)

    recommendations = []
    
    # Threshold for reporting regional trends (Privacy & Significance)
    MIN_USERS_FOR_REGION = 10

    # --- PART A: REGIONAL TRENDS (State -> Country) ---
    regional_candidates = []
    
    # Try State first
    if user_state:
        state_users_count = users_df[users_df['state'] == user_state]['userId'].nunique()
        if state_users_count >= MIN_USERS_FOR_REGION:
            print(f"Sufficient data for State: {user_state} ({state_users_count} users)")
            state_popularity = merged_df[merged_df['state'] == user_state].groupby('animeId').size().reset_index(name='watch_count')
            state_top = state_popularity[~state_popularity['animeId'].isin(user_watched)].sort_values(by='watch_count', ascending=False)
            regional_candidates = state_top.head(5)['animeId'].tolist()
    
    # Fallback to Country if no State data
    if not regional_candidates and user_country:
        country_users_count = users_df[users_df['country'] == user_country]['userId'].nunique()
        if country_users_count >= MIN_USERS_FOR_REGION:
            print(f"Sufficient data for Country: {user_country} ({country_users_count} users)")
            country_popularity = merged_df[merged_df['country'] == user_country].groupby('animeId').size().reset_index(name='watch_count')
            country_top = country_popularity[~country_popularity['animeId'].isin(user_watched)].sort_values(by='watch_count', ascending=False)
            regional_candidates = country_top.head(5)['animeId'].tolist()

    recommendations.extend(regional_candidates)

    # --- PART B: NEW & HOT (Recency + Rating) ---
    six_months_ago = datetime.now() - timedelta(days=180)
    anime_df['releaseDate'] = pd.to_datetime(anime_df['releaseDate'], errors='coerce')
    
    recent_anime = anime_df[(anime_df['releaseDate'] >= six_months_ago)]
    if not recent_anime.empty:
        # Sort by release date and take IDs not watched
        recent_top = recent_anime[~recent_anime['animeId'].isin(user_watched)].sort_values(by='releaseDate', ascending=False)
        recommendations.extend(recent_top.head(3)['animeId'].tolist())

    # --- PART C: GLOBAL ALL-TIME FAVORITES (Bayesian Weighting) ---
    m = 5 # min ratings
    C = merged_df['score'].mean() if not merged_df.empty else 7.0
    
    if not merged_df.empty:
        stats = merged_df.groupby('animeId')['score'].agg(['count', 'mean'])
        stats['weighted_score'] = (stats['count'] * stats['mean'] + m * C) / (stats['count'] + m)
        global_top = stats[~stats.index.isin(user_watched)].sort_values(by='weighted_score', ascending=False)
        recommendations.extend(global_top.head(5).index.tolist())

    # De-duplicate, preserve order, and limit
    final_recoms = []
    seen = set(user_watched)
    for rid in recommendations:
        if rid not in seen:
            final_recoms.append(rid)
            seen.add(rid)
            if len(final_recoms) >= number_of_recommendations:
                break
                
    return final_recoms
