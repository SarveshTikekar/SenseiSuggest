CREATE TABLE "public"."user_bookmarked_anime" (

    "userId" INT NOT NULL REFERENCES "public"."users"("userId") ON DELETE CASCADE,
    "animeId" INT NOT NULL REFERENCES "public"."anime"("animeId") ON DELETE CASCADE,
    PRIMARY KEY ("userId", "animeId") 
)