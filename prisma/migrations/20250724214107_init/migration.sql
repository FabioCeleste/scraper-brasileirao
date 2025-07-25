-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "acronym" TEXT
);

-- CreateTable
CREATE TABLE "players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "team_id" INTEGER NOT NULL,
    CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "start_date" TEXT NOT NULL,
    "tweet_id" TEXT
);

-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "round" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,
    "home_team_id" INTEGER NOT NULL,
    "away_team_id" INTEGER NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tweet_id" TEXT,
    CONSTRAINT "matches_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "match_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    CONSTRAINT "goals_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goals_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goals_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "match_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    CONSTRAINT "cards_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cards_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cards_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "statistics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "team_id" INTEGER,
    "player_id" INTEGER,
    "value" INTEGER NOT NULL,
    CONSTRAINT "statistics_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "statistics_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
