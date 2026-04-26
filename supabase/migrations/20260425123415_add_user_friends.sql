alter TABLE "public"."users"
ADD COLUMN "friends" integer[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "public"."friend_requests"(
    req_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id integer NOT NULL REFERENCES users("userId"),
    receiver_id integer NOT NULL REFERENCES users("userId"),
    status varchar(20) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    req_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    req_updated_at TIMESTAMPTZ 
);