-- Initial Schema Migration for SenseiSuggest
-- Generated from Optimized SQLAlchemy Models

-- 1. Create Core Tables
CREATE TABLE locations (
    "locationId" SERIAL PRIMARY KEY,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100)
);
CREATE INDEX ix_locations_locationId ON locations ("locationId");

CREATE TABLE genres (
    "genreId" SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
CREATE INDEX ix_genres_genreId ON genres ("genreId");

CREATE TABLE anime (
    "animeId" SERIAL PRIMARY KEY,
    "animeName" VARCHAR NOT NULL UNIQUE,
    is_adult_rated BOOLEAN DEFAULT FALSE,
    is_running BOOLEAN DEFAULT TRUE,
    "releaseDate" TIMESTAMP NOT NULL,
    description VARCHAR(500),
    image_url_base_anime VARCHAR,
    trailer_url_base_anime VARCHAR,
    studio VARCHAR
);
CREATE INDEX ix_anime_animeId ON anime ("animeId");

CREATE TABLE users (
    "userId" SERIAL PRIMARY KEY,
    "userName" VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    "hashedPassword" VARCHAR NOT NULL,
    "profilePicture" VARCHAR,
    anime_watched_count INTEGER DEFAULT 0,
    anime_watching_count INTEGER DEFAULT 0,
    "locationId" INTEGER NOT NULL REFERENCES locations("locationId")
);
CREATE INDEX ix_users_userId ON users ("userId");
CREATE INDEX ix_users_locationId ON users ("locationId");

-- 2. Create Dependent Tables (Foreign Keys)
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    "animeId" INTEGER NOT NULL REFERENCES anime("animeId"),
    "seasonNumber" INTEGER NOT NULL,
    "seasonName" VARCHAR(255),
    "seasonInfo" VARCHAR(255),
    "seasonTrailer" VARCHAR,
    "seasonImage" VARCHAR,
    CONSTRAINT uq_anime_season UNIQUE ("animeId", "seasonNumber")
);
CREATE INDEX ix_seasons_animeId ON seasons ("animeId");

CREATE TABLE ratings (
    "ratingId" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users("userId"),
    "animeId" INTEGER NOT NULL REFERENCES anime("animeId"),
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_text VARCHAR(1000)
);
CREATE INDEX ix_ratings_ratingId ON ratings ("ratingId");
CREATE INDEX ix_ratings_userId ON ratings ("userId");
CREATE INDEX ix_ratings_animeId ON ratings ("animeId");

-- 3. Create Many-to-Many Association Tables
CREATE TABLE anime_genres (
    "animeId" INTEGER NOT NULL REFERENCES anime("animeId") ON DELETE CASCADE,
    "genreId" INTEGER NOT NULL REFERENCES genres("genreId") ON DELETE CASCADE,
    PRIMARY KEY ("animeId", "genreId")
);

CREATE TABLE user_watched_anime (
    "userId" INTEGER NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "animeId" INTEGER NOT NULL REFERENCES anime("animeId") ON DELETE CASCADE,
    PRIMARY KEY ("userId", "animeId")
);

CREATE TABLE user_watching_anime (
    "userId" INTEGER NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "animeId" INTEGER NOT NULL REFERENCES anime("animeId") ON DELETE CASCADE,
    PRIMARY KEY ("userId", "animeId")
);
