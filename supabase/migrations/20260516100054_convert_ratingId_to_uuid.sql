ALTER TABLE "public"."ratings" 
ALTER COLUMN "ratingId" DROP DEFAULT,
ALTER COLUMN "ratingId" SET DATA TYPE uuid USING gen_random_uuid(),
ALTER COLUMN "ratingId" SET DEFAULT gen_random_uuid();