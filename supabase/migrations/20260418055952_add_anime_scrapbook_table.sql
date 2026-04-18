CREATE TABLE IF NOT EXISTS "public"."anime_scrapbook" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" int NOT NULL REFERENCES "public"."users"("userId") ON DELETE CASCADE,
    "animeId" int NOT NULL REFERENCES "public"."anime"("animeId") ON DELETE CASCADE,
    "screenshotUrl" text NOT NULL,
    "storagePath" text NOT NULL,
    "screenshotDescription" text,
    "created_at" timestamp with time zone DEFAULT now()
);