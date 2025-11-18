CREATE TABLE IF NOT EXISTS "vehicles" (
  "id" serial PRIMARY KEY,
  "model" text NOT NULL,
  "finish" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);
