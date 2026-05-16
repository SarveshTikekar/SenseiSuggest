-- 1. Deduplicate existing ratings (keep the newest one for each user-anime pair)
DELETE FROM "public"."ratings" a
USING "public"."ratings" b
WHERE a."ratingId" < b."ratingId"
  AND a."userId" = b."userId"
  AND a."animeId" = b."animeId";

-- 2. Add the unique constraint
ALTER TABLE "public"."ratings" 
ADD CONSTRAINT unique_user_anime_rating UNIQUE ("userId", "animeId");