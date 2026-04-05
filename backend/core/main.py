from fastapi import FastAPI, Query, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from .database import get_supabase
from supabase import AsyncClient
from .schemas import *
from .utils import password_verifier, argon2_pwd_hasher, generate_uuid
from dotenv import load_dotenv
import os
import json
from recommendation_model.main_ml_model import main_recommendation_model

#Testing if application is working
app = FastAPI(

    title="Anime_Recommender",
    description="Centralised API for managing anime, users, ratings, genres, locations",
    version="1.0.0",
)

#For CORS
#Defined origins from where req would be sent / recieved

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sensei-suggest.vercel.app",
    "https://sensei-suggest-git-main-sarveshtikekar.vercel.app"
]

app.add_middleware(

    CORSMiddleware,
    allow_origins=origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

load_dotenv()
ADMIN_ID = os.environ.get("ADMIN_ID")

"""User APIs are declared here """

@app.get("/")
def root():
    return {"message": "Welcome to Anime Recommendation system by Sarvesh. Pls login or sign up if ur a new user"}

#Return user info
@app.get("/user/{user_id}", response_model=UserInfo, status_code=status.HTTP_200_OK)
async def get_user_info(user_id: int, supabase: AsyncClient = Depends(get_supabase)):
    response = await supabase.table("users").select("*, user_watched_anime(animeId, anime(*)), user_watching_anime(animeId, anime(*))").eq("userId", user_id).execute()
    data = response.data

    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id: {user_id} does not exist")
    
    user_data = data[0]
    watched_anime_list = [item["anime"] for item in user_data.get("user_watched_anime", []) if item.get("anime")]
    watching_anime_list = [item["anime"] for item in user_data.get("user_watching_anime", []) if item.get("anime")]

    userInfobj = UserInfo(
        userName=user_data.get("userName"),
        watchedAnime=watched_anime_list,  
        watchingAnime=watching_anime_list, 
        anime_watched_count=len(watched_anime_list), 
        anime_watching_count=len(watching_anime_list),
    )

    return userInfobj
    
""" Anime APIs are declared here """

#Return the newest 5 animes as default
@app.get("/newest-5-anime")
async def get_top_5(supabase: AsyncClient = Depends(get_supabase)):
    response = await supabase.table("anime").select("*").order("releaseDate", desc=True).limit(5).execute()
    return response.data

#Return the newest n animes as default
@app.get("/anime/newest/{count}")
async def get_topn(count: int, supabase: AsyncClient = Depends(get_supabase)):
    response = await supabase.table("anime").select("*").order("releaseDate", desc=True).limit(count).execute()
    return response.data

#Returns the top rated anime
@app.get("/anime/top-rated", status_code=status.HTTP_200_OK)
async def get_top_rated(supabase: AsyncClient = Depends(get_supabase)) -> dict:
    
    # Since PostgREST doesn't support complex aggregations natively, we fetch aggregated data or calculate it.
    # For production, an RPC or View in Supabase is recommended. Here we compute it in Python.
    response = await supabase.table("ratings").select("score, anime(animeId, animeName, releaseDate, image_url_base_anime)").execute()
    ratings_data = response.data
    
    if not ratings_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No ratings found")
    
    anime_stats = {}
    for r in ratings_data:
        anime = r.get("anime")
        if not anime: continue
        a_id = anime["animeId"]
        if a_id not in anime_stats:
            anime_stats[a_id] = {"anime": anime, "total": 0, "positive": 0}
        
        anime_stats[a_id]["total"] += 1
        if r["score"] > 5:
            anime_stats[a_id]["positive"] += 1
            
    best_ratio = -1
    best_anime = None
    
    for a_id, stats in anime_stats.items():
        ratio = (stats["positive"] * 100.0) / stats["total"]
        if ratio > best_ratio:
            best_ratio = ratio
            best_anime = stats["anime"]

    if not best_anime:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anime not found")
    

    dict = {
        "animeName" : best_anime["animeName"],
        "releaseDate": best_anime["releaseDate"],
        "image_url_base_anime": best_anime["image_url_base_anime"],
        "Positivity Percentage": best_ratio
    }

    return dict

#Get all anime
@app.get("/anime/all", status_code=status.HTTP_200_OK)
async def get_all_anime(supabase: AsyncClient = Depends(get_supabase)):

    response = await supabase.table("anime").select("*").execute()
    results = response.data

    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No Anime found")
    list_of_animes = []
    
    for result in results:
        list_of_animes.append(
            browseAnime(
                animeName=result["animeName"],
                image_url_base_anime=result.get("image_url_base_anime"),
                animeId=result["animeId"],
            )
        )
    return list_of_animes

#Get specific anime Info
@app.get("/anime/{anime_name}", response_model=AnimeGet, status_code=status.HTTP_200_OK)
async def get_anime_info(anime_name: str, supabase: AsyncClient = Depends(get_supabase)):
    
    response = await supabase.table("anime").select("*, anime_genres(genreId, genres(name)), seasons(*)").eq("animeName", anime_name).execute()
    data = response.data
    
    if not data: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anime {anime_name} not found")

    query_result = data[0]
    genre_list = [g["genres"]["name"] for g in query_result.get("anime_genres", []) if g.get("genres")]

    animeGetObj = AnimeGet(
        animeId = query_result["animeId"],
        animeName = query_result["animeName"],
        genres = genre_list,
        is_adult_rated = query_result.get("is_adult_rated"),
        is_running = query_result.get("is_running"),
        releaseDate = query_result.get("releaseDate"),
        description = query_result.get("description"),
        image_url_base_anime = query_result.get("image_url_base_anime"),
        trailer_url_base_anime = query_result.get("trailer_url_base_anime"),
        studio = query_result.get("studio"),
    )

    return animeGetObj

#Adding a new user on the site
@app.post("/signup", status_code=status.HTTP_200_OK)
async def get_user_info(user: UserBasicCreate, supabase: AsyncClient = Depends(get_supabase)):
    
    hashed_password = argon2_pwd_hasher(user.password)
    
    loc_resp = await supabase.table("locations").select("locationId").eq("city", user.city).eq("state", user.state).eq("country", user.country).execute()
    
    if not loc_resp.data:
        raise HTTPException(status_code=400, detail="Location not found")
        
    location_id = loc_resp.data[0]["locationId"]

    user_query = await supabase.table("users").select("userId").execute()
    existing_ids = [u["userId"] for u in user_query.data]
    id_uuid = generate_uuid(existing_ids)

    new_user = {
        "userId": id_uuid,
        "userName": user.userName, 
        "hashedPassword": hashed_password,
        "email": user.email, 
        "locationId": location_id,
        "anime_watched_count": 0,
        "anime_watching_count": 0,
        "profilePicture": ""
    }

    try:
        await supabase.table("users").insert(new_user).execute()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Due to error: {e} caused hence the new user was not created hence please try again")
    
    return {"message": f"User {user.userName} created successfully and welcome to this Anime Recommendation system"}

#For user login
@app.post("/login", response_model=loginSuccess)
async def login(credentials: userLogin, supabase: AsyncClient = Depends(get_supabase)):

    response = await supabase.table("users").select("*").or_(f"userName.eq.{credentials.userName_or_email},email.eq.{credentials.userName_or_email}").execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or email", headers={"WWW-Authenticate": "Bearer"},)

    user = response.data[0]

    if not password_verifier(credentials.password, user["hashedPassword"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password", headers={"WWW-Authenticate": "Bearer"},)

    return loginSuccess(userId=user["userId"], userName=user["userName"], email=user["email"])

#Recommendation model output to be displayed on the recommendation dashboard
@app.get("/get_recommendations/{user_id}", status_code=status.HTTP_200_OK)
async def recommendations(user_id: int, supabase: AsyncClient = Depends(get_supabase)):
    
    recommendation_list = main_recommendation_model(user_id)
    animeSet = set()

    for recommendation in recommendation_list:
        for item in recommendation:
            animeSet.add(item)

    animeSet = list(animeSet)
    
    if animeSet:
        response = await supabase.table("anime").select("*").in_("animeId", animeSet).execute()
        animeList = response.data
    else:
        animeList = []

    #For ratings distribution
    rating_resp = await supabase.table("ratings").select("score").execute()
    ratings_distrib = {}
    for r in rating_resp.data:
        score = r["score"]
        ratings_distrib[score] = ratings_distrib.get(score, 0) + 1
    ratings_distrib = dict(sorted(ratings_distrib.items()))
    
    print()
    # For genre_anime_distribution  (N+1 optimizations applied)
    genre_resp = await supabase.table("anime_genres").select("genres(name)").execute()
    genre_anime_distribution = {}
    for item in genre_resp.data:
        name = item["genres"]["name"]
        genre_anime_distribution[name] = genre_anime_distribution.get(name, 0) + 1

    genre_anime_distributionList = [{name: count} for name, count in genre_anime_distribution.items()]
    
    # most popular animes
    rt_resp = await supabase.table("ratings").select("score, anime(animeId, animeName, releaseDate, image_url_base_anime)").execute()
    anime_stats = {}
    for r in rt_resp.data:
        anime = r.get("anime")
        if not anime: continue
        a_id = anime["animeId"]
        if a_id not in anime_stats:
            anime_stats[a_id] = {"anime": anime, "total": 0, "positive": 0}
        anime_stats[a_id]["total"] += 1
        if r["score"] > 5:
            anime_stats[a_id]["positive"] += 1
            
    best_ratio = -1
    best_anime = None
    
    for a_id, stats in anime_stats.items():
        ratio = (stats["positive"] * 100.0) / stats["total"]
        if ratio > best_ratio:
            best_ratio = ratio
            best_anime = stats["anime"]

    if best_anime is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anime not found")
    
    dict_res = {
        "animeName" : best_anime["animeName"],
        "releaseDate": best_anime["releaseDate"],
        "image_url_base_anime": best_anime["image_url_base_anime"],
        "Positivity Percentage": best_ratio,
    }

    return {"recommendations": animeList, "ratings_distribution": ratings_distrib, "Genre_anime_distrib": genre_anime_distributionList, "most_popular_anime": dict_res, "message": f"Great Recommendations are generated for {user_id}"}

#For admin side APIs where ADMIN_ID is fetched from env to prevent unauthorized access
@app.post("/add_season", status_code=status.HTTP_200_OK)
async def add_season(seasonData: SeasonsCreate, supabase: AsyncClient = Depends(get_supabase)):

    seasonObj = {
        "animeId": seasonData.animeId,
        "seasonNumber": seasonData.seasonNumber,
        "seasonName": seasonData.seasonName,
        "seasonInfo": seasonData.seasonInfo,
        "seasonTrailer": seasonData.seasonTrailer,
        "seasonImage": seasonData.seasonImage,
    }

    try:
        await supabase.table("seasons").insert(seasonObj).execute()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Season couldn't be added")
    
    return {'message': f"Season for {seasonData.animeName} added successfully"}
    

#To add new genres
@app.post("/add_genre", status_code=status.HTTP_200_OK)
async def add_genre(genre: genreCreate, user_id: int = 8, supabase: AsyncClient = Depends(get_supabase)):
    
    if user_id != int(ADMIN_ID):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=f"User is prohibited from doing this action")

    pass

#To get all genres
@app.get('/genres/all')
async def get_all_genres(supabase: AsyncClient = Depends(get_supabase)):

    response = await supabase.table("genres").select("*").execute()
    return response.data

#To get all seasons
@app.get('/seasons/all')
async def get_all_seasons(supabase: AsyncClient = Depends(get_supabase)):

    response = await supabase.table("seasons").select("*").execute()
    return response.data


@app.get('/get_cities/{stateName}')
async def get_cities(stateName: str, supabase: AsyncClient = Depends(get_supabase)):

    response = await supabase.table("locations").select("city").eq("state", stateName).execute()
    cities = list(set([item["city"] for item in response.data if item.get("city")]))
    cities.sort()
    return cities

@app.get('/get_states/{countryName}')
async def get_states(countryName: str, supabase: AsyncClient = Depends(get_supabase)):
    
    response = await supabase.table("distinct_country_state_pairs").select("state").ilike("country", countryName).execute()
    states = list(item["state"] for item in response.data)
    states.sort()
    
    if not states:
        print(f"No states found for country: {countryName}")
        return [] 

    return states

@app.get('/get_countries')
async def get_countries(supabase: AsyncClient = Depends(get_supabase)):

    return ["India"]


#APIs for watching and watched anime

@app.patch("/add-to-watched-list/", status_code=status.HTTP_200_OK)
async def add_to_watched_list(animeListUpdate: AnimeListUpdate, supabase: AsyncClient = Depends(get_supabase)):

    check_watched = await supabase.table("user_watched_anime").select("*").eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    if check_watched.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime already in watched list")
    
    await supabase.table("user_watching_anime").delete().eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    
    try:
        await supabase.table("user_watched_anime").insert({"userId": animeListUpdate.userId, "animeId": animeListUpdate.animeId}).execute()
    except Exception as e:
        print(f"Error adding to watched list for user: {e}") 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be added to watchedlist")
    
    await sync_user_stats(animeListUpdate.userId, supabase)
    return {'message': "Anime added successfully to watch List"}


@app.patch("/add-to-watching-list/", status_code=status.HTTP_200_OK)
async def add_to_watching_list(animeListUpdate: AnimeListUpdate, supabase: AsyncClient = Depends(get_supabase)):

    check_watching = await supabase.table("user_watching_anime").select("*").eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    if check_watching.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime already in watching list")
    
    await supabase.table("user_watched_anime").delete().eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    
    try:
        await supabase.table("user_watching_anime").insert({"userId": animeListUpdate.userId, "animeId": animeListUpdate.animeId}).execute()
    except Exception as e:
        print(f"Error adding to watching list for user {animeListUpdate.userId}: {e}") 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be added to watching list")
    
    await sync_user_stats(animeListUpdate.userId, supabase)
    return {'message': "Anime added successfully to watching List"}


@app.patch("/remove-from-watched-list/", status_code=status.HTTP_200_OK)
async def remove_from_watched_list(animeListUpdate: AnimeListUpdate, supabase: AsyncClient = Depends(get_supabase)):

    check_watched = await supabase.table("user_watched_anime").select("*").eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    if not check_watched.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime not in watched list")

    try:
        await supabase.table("user_watched_anime").delete().eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    except Exception as e:
        print(f"Error removing from watched list for user {animeListUpdate.userId}: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be removed from watched list")
    
    await sync_user_stats(animeListUpdate.userId, supabase)
    return {'message': "Anime removed successfully from watched List"}


@app.patch("/remove-from-watching-list/", status_code=status.HTTP_200_OK)
async def remove_from_watching_list(animeListUpdate: AnimeListUpdate, supabase: AsyncClient = Depends(get_supabase)):

    check_watching = await supabase.table("user_watching_anime").select("*").eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    if not check_watching.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime not in watching list")

    try:
        await supabase.table("user_watching_anime").delete().eq("userId", animeListUpdate.userId).eq("animeId", animeListUpdate.animeId).execute()
    except Exception as e:
        print(f"Error removing from watching list for user {animeListUpdate.userId}: {e}") 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be removed from watching list")
    
    await sync_user_stats(animeListUpdate.userId, supabase)
    return {'message': "Anime removed successfully from watching List"}


async def sync_user_stats(user_id: int, supabase: AsyncClient):
    """Synchronizes anime_watched_count and anime_watching_count for a user."""
    try:
        watched_res = await supabase.table("user_watched_anime").select("animeId", count="exact").eq("userId", user_id).execute()
        watching_res = await supabase.table("user_watching_anime").select("animeId", count="exact").eq("userId", user_id).execute()
        
        watched_count = watched_res.count if watched_res.count is not None else 0
        watching_count = watching_res.count if watching_res.count is not None else 0
        
        await supabase.table("users").update({
            "anime_watched_count": watched_count,
            "anime_watching_count": watching_count
        }).eq("userId", user_id).execute()
        return True
    except Exception as e:
        print(f"Error syncing stats for user {user_id}: {e}")
        return False


#User Profile API
@app.get('/profile/{user_id}', status_code=status.HTTP_200_OK)
async def user_profile(user_id: int, supabase: AsyncClient = Depends(get_supabase)):

    response = await supabase.table("users").select("*, user_watched_anime(animeId, anime(*)), user_watching_anime(animeId, anime(*))").eq("userId", user_id).execute()
    data = response.data

    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User not found")
    
    result = data[0]

    watchedList = [
        AnimesForUserProfile(
            animeId=item["anime"]["animeId"],
            animeName=item["anime"]["animeName"],
            image_url_base_anime=item["anime"].get("image_url_base_anime"),
        ) for item in result.get("user_watched_anime", []) if item.get("anime")
    ]

    watchingList = [
        AnimesForUserProfile(
            animeId=item["anime"]["animeId"],
            animeName=item["anime"]["animeName"],
            image_url_base_anime=item["anime"].get("image_url_base_anime"),
        ) for item in result.get("user_watching_anime", []) if item.get("anime")
    ]

    userProfileObj = UserProfile(
        userId = result["userId"],
        userName = result["userName"],
        email = result["email"],
        profilePicture=result.get("profilePicture", ""),
        watchedAnime=watchedList,
        watchingAnime=watchingList,
    )

    return {"UserProfile": userProfileObj, "message": "User profile fetched successfully"}