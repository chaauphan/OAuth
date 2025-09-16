-- Create Game table
CREATE TABLE IF NOT EXISTS "Game" (
  id SERIAL PRIMARY KEY,
  "mobyGamesId" INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  platform TEXT,
  "releaseDate" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create UserGame table
CREATE TABLE IF NOT EXISTS "UserGame" (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "gameId" INTEGER NOT NULL,
  "addedAt" TIMESTAMP DEFAULT NOW(),
  "playedAt" TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_game FOREIGN KEY("gameId") REFERENCES "Game"(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_game UNIQUE("userId", "gameId")
);

-- Add playedAt column to existing UserGame table if it doesn't exist
ALTER TABLE "UserGame" ADD COLUMN IF NOT EXISTS "playedAt" TIMESTAMP; 
ALTER TABLE "UserGame" ADD COLUMN IF NOT EXISTS "rating" INT4;

CREATE TABLE IF NOT EXISTS "SearchCache" (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "SearchCache_expiresAt_idx" ON "SearchCache"("expiresAt");