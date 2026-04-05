import os
import pandas as pd
import ast

def process_data(ratings_df, anime_df, users_df, locations_df, genres_df, seasons_df):

    print(f"\n\n{users_df.columns}")
    """ First we do the datatype conversion to true datatypes for columns """

    anime_df['genres'] = anime_df['genres'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)
    users_df['watchedAnime'] = users_df['watchedAnime'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)
    users_df['watchingAnime'] = users_df['watchingAnime'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)

    """Then we perform some date conversions"""
    
    #Coerce error to replace invalid dates with NaN
    ratings_df['created_at'] = pd.to_datetime(ratings_df['created_at'], errors='coerce')
    ratings_df['updated_at'] = pd.to_datetime(ratings_df['updated_at'], errors='coerce')
    anime_df['releaseDate'] = pd.to_datetime(anime_df['releaseDate'], errors='coerce')

    print(anime_df['genres'].head(5))
    print(users_df[['watchedAnime', 'watchingAnime']].head(5))


    
    """ Table joins to create a merged df after all conversion operations"""

    print("Performing the initial table joins \n")

    users_with_locations_df = pd.merge(users_df, locations_df, how='left', on='locationId')
    print(users_with_locations_df)

    merged_df = pd.merge(

        ratings_df,
        users_with_locations_df,
        on='userId',
        how='left' 

    )
    print(merged_df)

    
    merged_df = pd.merge(

        merged_df,
        anime_df,
        on='animeId'
    )
    print(f"Newly merged DF is: {merged_df}")

    print(f"First 10 rows in the merged df is : {merged_df.head(10)}")


    """Filling the missing descriptive values """
    merged_df['studio'] = merged_df['studio'].fillna('Unknown')
    merged_df['description'] = merged_df['description'].fillna('')
    merged_df['review_text'] = merged_df['review_text'].fillna('')


    """Converting Genre Dataframe to Dictionary """
    genres_map = genres_df.set_index('genreId')['name'].to_dict()

    merged_df['genre_names'] = merged_df['genres'].apply(

        lambda x: [genres_map.get(gid, 'Unknown genre') for gid in x] if isinstance(x, list) else []
    )

    print(merged_df[['animeName', 'genre_names']].head(10))


    """Now for the basic recommendation we would normalize average rating given by each user and recieved by each anime """
    user_average_score = merged_df.groupby('userId')['score'].mean().reset_index().rename(columns={'score': 'user_average_rating'})
    merged_df = pd.merge(merged_df, user_average_score, on='userId', how='left')

    anime_average_score = merged_df.groupby('animeId')['score'].mean().reset_index().rename(columns={'score': 'anime_average_rating'})
    merged_df = pd.merge(merged_df, anime_average_score, on='animeId', how='left')

    print(merged_df[['userName', 'user_average_rating', 'animeName', 'anime_average_rating']])

    print(f'Final preprocessed data shape is \n {merged_df.shape}')
    print(f"{merged_df.columns.tolist()[:20]}")

    return merged_df, anime_df, users_df, genres_df, seasons_df
