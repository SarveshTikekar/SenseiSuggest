"""Recommedation technique 1: Using Item Based Collaborative Filtering based on cosine similarity

i.e if many people like anime A, and those same people like anime B as well, then a new user if starts watching
Anime A, would be recommended anime B as well
"""

from .ml_utils import cosine_similarity
import os, sys, ast
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)

def collaborative_recommender(user_id, ratings_df, anime_df, number_of_recommendations):
    
    print(f"Generating Recommendation for User using IBCF technique based on cosine similarity")

    """Converts ratings df into a matrix where columns are userIds and columns are animeIds
    Hence a cell of this matrix gives us the score given by the particular userId to the particular anime
    """
    
    user_item_matrix = ratings_df.pivot_table(index='userId', columns='animeId', values='score')

    #We transpose the matrix and if some user has not rated that anime then we set rating to 0 (Default)
    anime_features = user_item_matrix.T.fillna(0)

    """ Calculates cosine similarity matrix for each anime entry"""
    item_similarity_matrix = cosine_similarity(anime_features)

    item_similarity_df = pd.DataFrame(

        item_similarity_matrix,
        index=anime_features.index,
        columns=anime_features.index
    )

    print(f"Item similarity is: \n {item_similarity_df}")

    #Returns anime ids that a particluar user has already rated
    user_rated_animes = ratings_df[ratings_df['userId']==user_id]['animeId']

    if user_rated_animes.empty:
        print(f"{user_id} has not rated any animes yet")
        return []
    

    print(f"User has reviewed around {len(user_rated_animes)} animes")

    recommendation_scores = pd.Series(0.0, index=item_similarity_df.index)

    for rated_anime in user_rated_animes:
        #We get similarity score column for all animes that the user has rated
        similarities = item_similarity_df[rated_anime]
        recommendation_scores = recommendation_scores.add(similarities, fill_value=0)

    else:
        print(f"Warning: Rated anime ID {rated_anime} by User {user_id} not found in similarity matrix.")
    
    recommendation_scores = recommendation_scores[~recommendation_scores.index.isin(user_rated_animes)]
    recommendations_sorted = recommendation_scores.sort_values(ascending=False)
    top_n_recommended_anime_ids = recommendations_sorted.head(number_of_recommendations).index.tolist()

    return top_n_recommended_anime_ids