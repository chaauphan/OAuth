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
  CONSTRAINT fk_user FOREIGN KEY("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_game FOREIGN KEY("gameId") REFERENCES "Game"(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_game UNIQUE("userId", "gameId")
); 