""" Recommendation method 2: Using Association Rule Mining using watched Anime list of user as well as watching Anime List"""

import os, sys, ast
import pandas as pd
from .ml_utils import apriori, association_rules

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)

# Use pandas to transform the lists into transaction matrix (one-hot encoded)

def association_recommender(user_id, users_df, anime_df, number_of_recommendations):
    # Filter users with watch history
    history_df = users_df[users_df['watchedAnime'].apply(lambda x: len(x) > 0)]
    
    if history_df.empty:
        print(f"No user watch history found")
        return []

    # One-hot encoding for transactions
    # We create a mapping of all unique anime IDs first
    all_anime_ids = sorted(list(set([aid for sublist in history_df['watchedAnime'] for aid in sublist])))
    
    # Efficient encoding
    encoded_rows = []
    for watched in history_df['watchedAnime']:
        row = {aid: True for aid in watched}
        encoded_rows.append(row)
        
    transactions_df = pd.DataFrame(encoded_rows, columns=all_anime_ids).fillna(False)

    frequent_itemsets = apriori(transactions_df, min_support=0.1)

    if not frequent_itemsets:
        print(f"No item sets found")
        return []
    
    rules_list = association_rules(frequent_itemsets, min_confidence=0.4)

    if not rules_list:
        print(f"No rules generated")
        return []

    # Sort rules: higher confidence first
    rules = pd.DataFrame(rules_list).sort_values(by=['confidence'], ascending=False)
    # Get list of anime watched by the required user
    user_watched_series = users_df[users_df['userId'] == user_id]['watchedAnime']
    user_watched_animes_list = user_watched_series.iloc[0] if not user_watched_series.empty else []

    # Frozen set so that list is immutable    
    user_watched_animes = frozenset(user_watched_animes_list)

    #Initialize a empty set to get the recommended ids
    recommended_animeIds = set()

    for index, row in rules.iterrows():
        antecedent = row['antecedents']
        consequent = row['consequents']

        if antecedent.issubset(user_watched_animes):
            for recommend in consequent:

                if recommend not in user_watched_animes:
                    recommended_animeIds.add(recommend)

            if len(recommended_animeIds) > number_of_recommendations:
                break 
        
    final_recommendation = list(recommended_animeIds)[:number_of_recommendations]

    return final_recommendation

