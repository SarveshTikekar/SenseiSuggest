from pydantic import BaseModel, Field, EmailStr, HttpUrl, ConfigDict, field_validator, model_validator,computed_field
from typing import List, Optional
from datetime import datetime
import uuid

#Database Tables
class LocationTable(BaseModel):
    locationId: int
    country: str = Field(..., max_length=50)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    model_config = ConfigDict(from_attributes=True)

class GenreTable(BaseModel):
    genreId: int
    name: str = Field(..., max_length=100)
    model_config = ConfigDict(from_attributes=True)

class SeasonsTable(BaseModel):
    animeId: int
    seasonNumber: int = Field(..., description="The sequential number of the season for that anime (e.g., 1, 2, 3)")
    seasonName: Optional[str] = Field(None, examples=["Demon Slayer: Kimetsu no Yaiba(Season 1)", "Dandadan season 2"])
    seasonInfo : str = Field(None, max_length=1024)
    seasonTrailer: Optional[HttpUrl]
    seasonImage : Optional[HttpUrl]

class AnimeTable(BaseModel):
    animeId: int
    animeName: str
    genres: List[int] = Field([])
    is_adult_rated: bool
    is_running: bool
    releaseDate: datetime
    seasons: List[int] = Field([])
    description: Optional[str] = Field(None, max_length=500, description="Description of the anime")
    image_url_base_anime: Optional[HttpUrl] = None
    trailer_url_base_anime: Optional[HttpUrl] = None
    studio: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class RatingsTable(BaseModel):
    ratingId: int
    userId: int
    animeId: int
    score: int = Field(..., ge=1, le=10)
    created_at: datetime
    updated_at: datetime
    reviewText: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class UsersTable(BaseModel):
    userId: int
    userName: str = Field(..., min_length=8, max_length=32)
    email: EmailStr
    hashedPassword: str
    profilePicture: Optional[HttpUrl]
    watchedAnime: List[int] = Field([])
    watchingAnime: List[int] = Field([])
    friends: List[int] = Field([])
    anime_watched_count: int = 0
    anime_watching_count: int = 0
    model_config = ConfigDict(from_attributes=True)

#For API Crud operations

#This one is for sys admin to add animes
class AnimeCreate(BaseModel):
    animeName: str = Field(..., max_length=255)
    genreIds: List[int] = Field([])
    is_adult_rated: bool = False
    is_running: bool = True
    releaseDate: datetime
    seasons : List[int] = []
    description: Optional[str] = Field(None, max_length=500)
    image_url_base_anime: Optional[HttpUrl] = None
    trailer_url_base_anime: Optional[HttpUrl] = None
    studio: Optional[str] = Field(None, max_length=255)

#Get entire anime info
class AnimeGet(BaseModel):
    animeId: int
    animeName: str
    genres: List[str]
    seasons: List[SeasonsTable]
    is_adult_rated: bool = False
    is_running: bool = True
    releaseDate: datetime
    description: Optional[str] = Field(None)
    image_url_base_anime: Optional[str] = None
    trailer_url_base_anime: Optional[str] = None
    studio: Optional[str] = Field(None, max_length=255)
    model_config = ConfigDict(from_attributes=True)

#Consolidated Anime info for user
class AnimeListForUser(BaseModel):
    animeId: int
    animeName: str
    model_config = ConfigDict(from_attributes=True)

class UserBasicCreate(BaseModel):
    userName: str
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=32)
    country: str = Field(..., max_length=50)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)

class UserDashBoard(BaseModel):
    userName: str
    location: LocationTable
    profilePicture: Optional[HttpUrl]
    watchedAnime: List[AnimeListForUser] = Field([])
    watchingAnime: List[AnimeListForUser] = Field([])
    anime_watched_count: int = 0
    anime_watching_count: int = 0
    model_config = ConfigDict(from_attributes=True)
    friends: List[int] = Field([], description="Friends of the user")

class UserInfo(BaseModel):
    userName: str
    watchedAnime: List[AnimeListForUser]
    watchingAnime: List[AnimeListForUser]
    bookmarkedAnime: List[AnimeListForUser] = Field([])
    anime_watched_count: int = 0
    anime_watching_count: int = 0
    friends: List[int] = Field([], description="Friends of the user")

#A rating created by the user
class RatingCreateModel(BaseModel):
    userId: int
    animeId: int
    score: int = Field(..., ge=1, le=10)
    reviewText: Optional[str] = Field(None, max_length=1000)

#Returns the user rating for a specific anime
class userRatingforAnime(BaseModel):
    userName: str
    animeName: str
    score: int = Field(..., ge=1, le=10)
    reviewText: Optional[str] = Field(None, max_length=1000)

class UserForRatingResponse(BaseModel):
    userId: int
    userName: str
    model_config = ConfigDict(from_attributes=True)

# Detailed Rating Response model (for API output)
class RatingDetailResponse(BaseModel):
    ratingId: int
    user: UserForRatingResponse
    anime: AnimeListForUser    # Reuse AnimeListForUser for simplified anime info
    score: int = Field(..., ge=1, le=10)
    reviewText: Optional[str] = Field(None, max_length=1000)
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

#Returns all the ratings
class userRatingAll(BaseModel):
    userName: str
    ratings: List[RatingDetailResponse]
    model_config = ConfigDict(from_attributes=True)

class genreCreate(BaseModel):
    genreId: int
    name: str = Field(..., max_length=100)

class userLogin(BaseModel):
    userName_or_email: str
    password: str

class loginSuccess(BaseModel):
    userId: int
    userName: str
    email: str
    message: str = "Login Successful"

class browseAnime(BaseModel):
    animeId: int
    animeName: str
    image_url_base_anime: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class SeasonsCreate(BaseModel):
    animeId: int
    seasonNumber: int = Field(..., description="The sequential number of the season for that anime (e.g., 1, 2, 3)")
    seasonName: Optional[str] = Field(None, examples=["Demon Slayer: Kimetsu no Yaiba(Season 1)", "Dandadan season 2"])
    seasonInfo : str = Field(None, max_length=1000)
    seasonTrailer: Optional[str]
    seasonImage : Optional[str]
    model_config = ConfigDict(from_attributes=True)

class AnimeListUpdate(BaseModel):
    userId: int
    animeId: int
    model_config = ConfigDict(from_attributes=True)


#For User Profile
class AnimesForUserProfile(BaseModel):
    animeId: int
    animeName: str
    image_url_base_anime: Optional[str] = None

class UserProfile(BaseModel):
    userId: int
    userName: str
    email: EmailStr
    profilePicture: Optional[str] = None
    watchedAnime: List[AnimesForUserProfile] = Field([])
    watchingAnime: List[AnimesForUserProfile] = Field([])
    bookmarkedAnime: List[AnimesForUserProfile] = Field([])
    friends: List[int] = Field([])

    @computed_field
    @property
    def anime_watched_count(self) -> int:
        return len(self.watchedAnime)

    @computed_field
    @property
    def anime_watching_count(self) -> int:
        return len(self.watchingAnime)

    @computed_field
    @property
    def anime_bookmarked_count(self) -> int:
        return len(self.bookmarkedAnime)
    

    model_config = ConfigDict(from_attributes=True)


""" Object for Bookmarking an anime """
class BookmarkAnime(BaseModel):
    userId: int = Field(...)
    animeId: int = Field(...)

""" Object for Adding a scrapbook entry """
class ScrapBookEntry(BaseModel):
    userId: int = Field(...)
    animeId: int = Field(...)
    screenshotUrl: Optional[str] = None
    screenshotDescription: Optional[str] = Field(None, max_length=180)
    storagePath: Optional[str] = None

class ScrapBookResponse(ScrapBookEntry):
    id: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ScrapBookRemove(BaseModel):
    userId: int = Field(...)
    animeId: int = Field(...)
    scrapbookEntryId: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class FriendRequest(BaseModel):
    sender_id: int = Field(...)
    receiver_id: int = Field(...)

class FriendRequestProcess(FriendRequest):
    action: str = Field(..., pattern="^(ACCEPT|REJECT)$")