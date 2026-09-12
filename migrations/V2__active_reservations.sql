CREATE TABLE IF NOT EXISTS "public"."active_reservations"
(
    id                TEXT PRIMARY KEY,
    restaurant_id     TEXT NOT NULL,
    email             TEXT NOT NULL,
    code              TEXT NOT NULL,
    "start"           TIMESTAMP NOT NULL,
    "end"             TIMESTAMP NOT NULL,
    number_of_people  INTEGER NOT NULL,
    created_at        TIMESTAMP DEFAULT NOW()
);
