""" Recommendation method 2: Using Association Rule Mining using watched Anime list of user as well as watching Anime List"""

import os, sys, ast
import pandas as pd
from mlxtend.frequent_patterns import association_rules, apriori
from mlxtend.preprocessing import TransactionEncoder

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)

#Use a transaction encoder to transform the lists into transaction matrix, where transc is row and all animeIds are columns

def association_recommender(user_id, users_df, anime_df, number_of_recommendations):

    te = TransactionEncoder()
    transactions = users_df[users_df['watchedAnime'].apply(lambda x: len(x) > 0)]['watchedAnime'].tolist()

    if transactions is None:
        print(f"No user watch history found")
        return []

    te_array = te.fit(transactions).transform(transactions)
    transactions_df = pd.DataFrame(te_array, columns=te.columns_)

    frequent_itemsets = apriori(transactions_df, min_support=0.4, use_colnames=True)

    if frequent_itemsets.empty:
        print(f"No item sets found")
        return []
    
    rules = association_rules(frequent_itemsets, min_threshold=0.4, metric="Confidence")

    if rules.empty:
        print(f"No rules generated")
        return []

    rules = rules.sort_values(by=['confidence', 'list'], ascending=False)
    #Get list of anime watched by the required user
    user_watched_animes = users_df[users_df['userId'] == user_id]['watchedAnime']

    if user_watched_animes.empty:
        print(f"User with {user_id} has not watched any animes yet")
        return []

    #Frozen set so that list is immutable    
    user_watched_animes = frozenset(user_watched_animes)

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

