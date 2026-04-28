from backend.core.schemas import FriendRequest
from fastapi import FastAPI, Query, HTTPException, Depends, status, UploadFile, File, Form  
from fastapi.middleware.cors import CORSMiddleware
from .database import get_supabase
from supabase import AsyncClient
from .schemas import *
from .utils import password_verifier, argon2_pwd_hasher, generate_uuid
from dotenv import load_dotenv
import os
import json
from backend.recommendation_model.main_ml_model import main_recommendation_model
import uuid
from datetime import datetime, timezone, timedelta

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
    allow_origins=["*"] if os.environ.get("VERCEL") == "1" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
IS_PROD = os.environ.get("VERCEL") == "1"
ADMIN_ID = os.environ.get("ADMIN_ID")

"""User APIs are declared here """

@app.get("/")
def root():
    return {"message": "Welcome to Anime Recommendation system by Sarvesh. Pls login or sign up if ur a new user"}
    
""" Anime APIs are declared here """

# Returns anime stats for the user like number of watching, watched, bookmarked and total animes
@app.get('/anime/stats/{user_id}', status_code=status.HTTP_200_OK)
async def get_anime_stats(user_id: int, supabase: AsyncClient = Depends(get_supabase)):

    res_watched = await supabase.table('user_watched_anime').select('animeId', count='exact').eq('userId', user_id).execute()
    res_bookmarked = await supabase.table('user_bookmarked_anime').select('animeId', count='exact').eq('userId', user_id).execute()
    res_watching = await supabase.table('user_watching_anime').select('animeId', count='exact').eq('userId', user_id).execute()
    res_total = await supabase.table('anime').select('animeId', count='exact').execute()

    return {
        "watched": res_watched.count or 0,
        "bookmarked": res_bookmarked.count or 0,
        "watching": res_watching.count or 0,
        "total": res_total.count or 0
    }

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
        if r["score"] >= 6:
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

#Sorting logic
@app.get('/anime/sort', status_code=status.HTTP_200_OK)
async def sort_results(sort_param: str, sort_order: str, supabase: AsyncClient = Depends(get_supabase)):


    response = await supabase.table("anime").select("*").order(f"{sort_param}", desc=True if sort_order == "desc" else False)\
    .execute()

    return response.data

#Filtering logic
@app.get('/anime/filter', status_code=status.HTTP_200_OK)
async def apply_filter(supabase: AsyncClient = Depends(get_supabase)):
    pass
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
    print(query_result)

    genre_list = [g["genres"]["name"] for g in query_result.get("anime_genres", []) if g.get("genres")]

    response = await supabase.table("seasons").select("*").eq("animeId", query_result.get("animeId")).order("seasonNumber").execute()
    seasons_info = response.data
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
        seasons=seasons_info
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
        "profilePicture": "",
        "friends": [],
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
    
    recom_dict = main_recommendation_model(user_id)
    
    # Helper to fetch detailed anime info for a list of IDs
    async def get_detailed_anime(ids):
        if not ids: return []
        resp = await supabase.table("anime").select("*").in_("animeId", ids).execute()
        # Maintain order of recommendation
        id_map = {a["animeId"]: a for a in resp.data}
        return [id_map[aid] for aid in ids if aid in id_map]

    categorized_results = {
        "primary": await get_detailed_anime(recom_dict.get("primary", [])),
        "contextual": await get_detailed_anime(recom_dict.get("contextual", [])),
        "discovery": await get_detailed_anime(recom_dict.get("discovery", []))
    }

    # For backward compatibility and analytics
    all_ids = set()
    for ids in recom_dict.values():
        all_ids.update(ids)
    
    full_anime_list = []
    if all_ids:
        resp = await supabase.table("anime").select("*").in_("animeId", list(all_ids)).execute()
        full_anime_list = resp.data

    # For ratings distribution
    rating_resp = await supabase.table("ratings").select("score").execute()
    ratings_distrib = {}
    if rating_resp.data:
        for r in rating_resp.data:
            score = r["score"]
            ratings_distrib[score] = ratings_distrib.get(score, 0) + 1
    ratings_distrib = dict(sorted(ratings_distrib.items()))
    
    # For genre_anime_distribution
    genre_resp = await supabase.table("anime_genres").select("genres(name)").execute()
    genre_anime_distribution = {}
    if genre_resp.data:
        for item in genre_resp.data:
            if item.get("genres"):
                name = item["genres"]["name"]
                genre_anime_distribution[name] = genre_anime_distribution.get(name, 0) + 1

    genre_anime_distributionList = [{name: count} for name, count in genre_anime_distribution.items()]
    
    # most popular animes
    rt_resp = await supabase.table("ratings").select("score, anime(animeId, animeName, releaseDate, image_url_base_anime)").execute()
    anime_stats = {}
    if rt_resp.data:
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

    dict_res = {}
    if best_anime:
        dict_res = {
            "animeName" : best_anime["animeName"],
            "releaseDate": best_anime["releaseDate"],
            "image_url_base_anime": best_anime["image_url_base_anime"],
            "Positivity Percentage": best_ratio,
        }

    # Identify labels for categories based on cold start
    is_cold_start = len(full_anime_list) < 5
    
    # Fetch user location for dynamic title
    user_location = "your region"
    user_resp = await supabase.table("users").select("locationId, locations(state, country)").eq("userId", user_id).execute()
    if user_resp.data and user_resp.data[0].get("locations"):
        loc = user_resp.data[0]["locations"]
        user_location = loc.get("state") or loc.get("country") or "your region"

    titles = {
        "primary": "Trending in " + user_location if is_cold_start else "AI Personalized Picks",
        "contextual": "New & Hot Releases" if is_cold_start else "Because you watched",
        "discovery": "Global Hall of Fame" if is_cold_start else "Discovery Zone"
    }

    return {
        "recommendations": full_anime_list, 
        "categorized": categorized_results,
        "category_titles": titles,
        "ratings_distribution": ratings_distrib, 
        "Genre_anime_distrib": genre_anime_distributionList, 
        "most_popular_anime": dict_res, 
        "is_cold_start": is_cold_start,
        "message": f"Great Recommendations generated for {user_id}"
    }

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

@app.patch("/add_as_bookmarked", status_code=status.HTTP_200_OK)
async def add_as_bookmarked(bookmarkData: BookmarkAnime, supabase: AsyncClient = Depends(get_supabase)):

    """ Check if anime is already bookmarked by the user """
    check_if_bookmarked = await supabase.table("user_bookmarked_anime").select("*").eq("userId", bookmarkData.userId).eq("animeId", bookmarkData.animeId).execute()

    if check_if_bookmarked.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Anime already bookmarked")
    
    """ If not bookmarked then add it as a bookmark """
    try:
        await supabase.table("user_bookmarked_anime").insert({"userId": bookmarkData.userId, "animeId": bookmarkData.animeId}).execute()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be bookmarked due to error: {e}")
    
    return {"message": "Anime bookmarked successfully"}


@app.post("/scrapbook/add", status_code=status.HTTP_201_CREATED)
async def add_to_scrapbook(
    userId: int = Form(...),
    animeId: int = Form(...),
    description: str = Form(None),
    image: UploadFile = File(...),
    supabase: AsyncClient = Depends(get_supabase)
):
    # 6-image limit check
    existing_count = await supabase.table("anime_scrapbook") \
        .select("id", count="exact") \
        .eq("userId", userId) \
        .eq("animeId", animeId) \
        .execute()
    
    if existing_count.count and existing_count.count >= 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Scrapbook limit reached! You can only have 6 images per anime."
        )

    uuId = uuid.uuid4()
    file_extension = image.filename.split(".")[-1]
    storage_path = f"user_{userId}/{animeId}/{uuId}.{file_extension}"
    file_content = await image.read()

    # Upload to Storage
    await supabase.storage.from_("anime_scrapbook").upload(
        path=storage_path,
        file=file_content,
        file_options={"content_type": image.content_type},
    )

    public_url = await supabase.storage.from_("anime_scrapbook").get_public_url(storage_path)

    try:
        # Create and validate the entry using the Pydantic model
        scrapbook_entry = ScrapBookResponse(
            id=uuId,
            userId=userId,
            animeId=animeId,
            screenshotUrl=public_url,
            storagePath=storage_path,
            screenshotDescription=description,
            created_at=datetime.now(timezone.utc)
        )
        
        # Insert validated data into DB
        await supabase.table("anime_scrapbook").insert(scrapbook_entry.model_dump(mode='json')).execute()
    except Exception as e:
        await supabase.storage.from_("anime_scrapbook").remove([storage_path])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database error: {e}")
    
    return {"message": "Scrapbook entry added successfully", "id": uuId} 


@app.delete("/scrapbook/remove/{scrapbook_id}", status_code=status.HTTP_200_OK)
async def remove_from_scrapbook(
    scrapbook_id: uuid.UUID,
    userId: int,
    animeId: int,
    supabase: AsyncClient = Depends(get_supabase)
):
    check_entry = await supabase.table("anime_scrapbook") \
        .select("storagePath") \
        .eq("id", scrapbook_id) \
        .eq("userId", userId) \
        .eq("animeId", animeId) \
        .execute()

    if not check_entry.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrapbook entry not found")
    
    storage_path = check_entry.data[0]["storagePath"]

    try:
        await supabase.storage.from_("anime_scrapbook").remove([storage_path])
        await supabase.table("anime_scrapbook").delete().eq("id", scrapbook_id).execute()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error during removal: {e}")
    
    return {"message": "Scrapbook entry removed successfully"}

# --- SCRAPBOOK ENDPOINTS ---
@app.get("/scrapbook/{user_id}", status_code=status.HTTP_200_OK)
async def get_scrapbook(user_id: int, supabase: AsyncClient = Depends(get_supabase)):

    try:
        
        response = await supabase.table("anime_scrapbook").select("id, userId, animeId, anime(animeName), screenshotUrl, screenshotDescription, created_at").eq("userId", user_id).execute()

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error fetching scrapbook: {e}")

    return {"message": f"Scrapbook entries fetched successfully for user {user_id}", "data": response.data}

@app.patch("/remove_as_bookmarked", status_code=status.HTTP_200_OK)
async def remove_as_bookmarked(bookmarkData: BookmarkAnime, supabase: AsyncClient = Depends(get_supabase)):

    """" Check if anime is bookmarked by the user """
    check_if_bookmarked = await supabase.table("user_bookmarked_anime").select("*").eq("userId", bookmarkData.userId).eq("animeId", bookmarkData.animeId).execute()

    if not check_if_bookmarked.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anime not bookmarked yet")
    
    try:
        await supabase.table("user_bookmarked_anime").delete().eq("userId", bookmarkData.userId).eq("animeId", bookmarkData.animeId).execute()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be removed from bookmarks due to error: {e}")
    
    return {"message": "Anime removed from bookmarks successfully"}


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

    response = await supabase.table("users").select("*, user_watched_anime(animeId, anime(*)), user_watching_anime(animeId, anime(*)), user_bookmarked_anime(animeId, anime(*))").eq("userId", user_id).execute()
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

    bookmarkedList = [
        AnimesForUserProfile(
            animeId=item["anime"]["animeId"],
            animeName=item["anime"]["animeName"],
            image_url_base_anime=item["anime"].get("image_url_base_anime"),
        ) for item in result.get("user_bookmarked_anime", []) if item.get("anime")
    ]

    userProfileObj = UserProfile(
        userId = result["userId"],
        userName = result["userName"],
        email = result["email"],
        profilePicture=result.get("profilePicture", ""),
        watchedAnime=watchedList,
        watchingAnime=watchingList,
        bookmarkedAnime=bookmarkedList,
    )

    return {"UserProfile": userProfileObj, "message": "User profile fetched successfully"}

# Friend Requests Handling API
@app.post('/initiate-connection', status_code=status.HTTP_200_OK)
async def initiate_friend_request(requestData: FriendRequest, supabase: AsyncClient = Depends(get_supabase)):
    """Check if u1 already has added u2 as friend"""
    
    # Check sender
    resp = await supabase.table("users").select("friends").eq("userId", requestData.sender_id).execute()
    if not resp.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sender not found")
    
    friends = resp.data[0].get("friends", []) or []
    if requestData.receiver_id in friends:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already friends with this user")
    
    # Prevent duplicate pending requests
    pending_check = await supabase.table("friend_requests")\
        .select("*")\
        .eq("sender_id", requestData.sender_id)\
        .eq("receiver_id", requestData.receiver_id)\
        .eq("status", "PENDING")\
        .execute()
    
    if pending_check.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A pending request already exists")

    # Insert new request
    await supabase.table("friend_requests").insert({
        "sender_id": requestData.sender_id, 
        "receiver_id": requestData.receiver_id,
        "status": "PENDING"
    }).execute()
    
    return {"message": f"Friend request sent successfully to {requestData.receiver_id}"}
    
@app.post('/process-connection', status_code=status.HTTP_200_OK)
async def friend_request_process(requestData: FriendRequestProcess, supabase: AsyncClient = Depends(get_supabase)):
    """Check and act on friend requests"""

    # Fetch the pending request
    resp = await supabase.table("friend_requests").select("*")\
        .eq("sender_id", requestData.sender_id)\
        .eq("receiver_id", requestData.receiver_id)\
        .eq("status", "PENDING")\
        .order("req_created_at", desc=True).limit(1).execute()
    
    if not resp.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No pending friend request found")
    
    req_id = resp.data[0]["req_id"]

    if requestData.action == "ACCEPT":
        # 1. Update Sender's friends
        sender_resp = await supabase.table("users").select("friends").eq("userId", requestData.sender_id).single().execute()
        sender_friends = set(sender_resp.data.get("friends", []) or [])
        sender_friends.add(requestData.receiver_id)
        await supabase.table("users").update({"friends": list(sender_friends)}).eq("userId", requestData.sender_id).execute()

        # 2. Update Receiver's friends
        receiver_resp = await supabase.table("users").select("friends").eq("userId", requestData.receiver_id).single().execute()
        receiver_friends = set(receiver_resp.data.get("friends", []) or [])
        receiver_friends.add(requestData.sender_id)
        await supabase.table("users").update({"friends": list(receiver_friends)}).eq("userId", requestData.receiver_id).execute()

        status_update = "ACCEPTED"
    else:
        status_update = "REJECTED"
    
    # Finalize the request record
    await supabase.table("friend_requests").update({
        "status": status_update, 
        "req_updated_at": datetime.now(timezone.utc).isoformat()
    }).eq("req_id", req_id).execute()

    return {"message": f"Friend request {status_update.lower()} successfully"}

@app.get('/allies/find', status_code=status.HTTP_200_OK)
async def find_allies(userId: int, query: str,supabase: AsyncClient = Depends(get_supabase)):

    """ Simple search for allies based on username """

    resp = await supabase.table("users").select("userId, userName, profilePicture").ilike("userName", f"{query}%").neq("userId", userId).execute()
    return resp.data

@app.get('/connections/pending/{userId}', status_code=status.HTTP_200_OK)
async def get_pending_requests(userId: int, supabase: AsyncClient = Depends(get_supabase)):
    """Fetch all pending friend requests for a user with sender details"""
    
    # 1. Prune expired first
    threshold = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    await supabase.table("friend_requests").delete().eq("status", "PENDING").lt("req_created_at", threshold).execute()

    # 2. Fetch pending requests
    resp = await supabase.table("friend_requests")\
        .select("*, sender:users!friend_requests_sender_id_fkey(userName, profilePicture)")\
        .eq("receiver_id", userId)\
        .eq("status", "PENDING")\
        .execute()
    
    return resp.data

@app.get('/anime/search/{query}', status_code=status.HTTP_200_OK)
async def search_anime(query: str, supabase: AsyncClient = Depends(get_supabase)):

    response = await supabase.table("lowercased_anime_names").select("*").ilike("animeName", f"{query}%").execute()

    # If nothing returned, return an empty list
    if response.data is None:
        return []
     
    anime_ids = [item["animeId"] for item in response.data if item.get("animeId")]
    return anime_ids

# An API for testing
@app.get('/SenseiSuggest/testing', status_code=status.HTTP_200_OK)
async def testing(supabase: AsyncClient = Depends(get_supabase)):

    resp = await supabase.table("users").select("friends").eq("userId", 6).execute()
    return resp