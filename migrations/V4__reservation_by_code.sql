CREATE TABLE IF NOT EXISTS "public"."reservation_by_code"
(
    id             TEXT PRIMARY KEY,
    restaurant_id  TEXT NOT NULL,
    code           TEXT NOT NULL,
    email          TEXT NOT NULL,
    "start"        TIMESTAMP NOT NULL,
    "end"          TIMESTAMP NOT NULL,
    party_size     INTEGER NOT NULL,
    created_at     TIMESTAMP DEFAULT NOW()
);
