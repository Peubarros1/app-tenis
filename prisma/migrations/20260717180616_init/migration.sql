-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO', 'COMPETITIVO');

-- CreateEnum
CREATE TYPE "CourtType" AS ENUM ('PUBLIC_OFFICIAL', 'PUBLIC_UNOFFICIAL', 'PRIVATE');

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('OFFICIAL_INTEGRATION', 'INTERNAL', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "SurfaceType" AS ENUM ('SAIBRO', 'QUADRA_DURA', 'GRAMA_SINTETICA', 'CARPETE', 'CONCRETO', 'OUTRO');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('OPEN', 'FULL', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchVisibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'CONFIRMED', 'WAITLIST', 'DECLINED', 'LEFT');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH_INVITE', 'MATCH_JOIN_REQUEST', 'MATCH_UPDATE', 'MATCH_CANCELLED', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'NEW_REVIEW', 'NEW_MESSAGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'INICIANTE',
    "neighborhood" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Recife',
    "state" TEXT NOT NULL DEFAULT 'PE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courtType" "CourtType" NOT NULL,
    "bookingMode" "BookingMode" NOT NULL,
    "surfaceType" "SurfaceType" NOT NULL,
    "isLighted" BOOLEAN NOT NULL DEFAULT false,
    "isIndoor" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Recife',
    "state" TEXT NOT NULL DEFAULT 'PE',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" geography(Point, 4326),
    "hourlyPriceCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "officialBookingUrl" TEXT,
    "bookingInstructions" TEXT,
    "phone" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtPhoto" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourtPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtOpeningHour" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,

    CONSTRAINT "CourtOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtReview" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourtReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteCourt" (
    "userId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteCourt_pkey" PRIMARY KEY ("userId","courtId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "externalReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "courtId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "minSkillLevel" "SkillLevel",
    "maxSkillLevel" "SkillLevel",
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "status" "MatchStatus" NOT NULL DEFAULT 'OPEN',
    "visibility" "MatchVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchMessage" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerRating" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_city_neighborhood_idx" ON "User"("city", "neighborhood");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Court_neighborhood_idx" ON "Court"("neighborhood");

-- CreateIndex
CREATE INDEX "Court_courtType_idx" ON "Court"("courtType");

-- CreateIndex
CREATE INDEX "Court_surfaceType_idx" ON "Court"("surfaceType");

-- CreateIndex
CREATE INDEX "CourtPhoto_courtId_idx" ON "CourtPhoto"("courtId");

-- CreateIndex
CREATE UNIQUE INDEX "CourtOpeningHour_courtId_dayOfWeek_key" ON "CourtOpeningHour"("courtId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "CourtReview_courtId_idx" ON "CourtReview"("courtId");

-- CreateIndex
CREATE UNIQUE INDEX "CourtReview_courtId_userId_key" ON "CourtReview"("courtId", "userId");

-- CreateIndex
CREATE INDEX "Booking_courtId_startTime_idx" ON "Booking"("courtId", "startTime");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Match_scheduledAt_idx" ON "Match"("scheduledAt");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_matchId_userId_key" ON "MatchParticipant"("matchId", "userId");

-- CreateIndex
CREATE INDEX "MatchMessage_matchId_createdAt_idx" ON "MatchMessage"("matchId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRating_matchId_raterId_ratedUserId_key" ON "PlayerRating"("matchId", "raterId", "ratedUserId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtPhoto" ADD CONSTRAINT "CourtPhoto_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtOpeningHour" ADD CONSTRAINT "CourtOpeningHour_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtReview" ADD CONSTRAINT "CourtReview_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtReview" ADD CONSTRAINT "CourtReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteCourt" ADD CONSTRAINT "FavoriteCourt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteCourt" ADD CONSTRAINT "FavoriteCourt_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchMessage" ADD CONSTRAINT "MatchMessage_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchMessage" ADD CONSTRAINT "MatchMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================================
-- Check constraints (regras que o Prisma Schema não expressa nativamente)
-- =====================================================================

ALTER TABLE "CourtReview" ADD CONSTRAINT "CourtReview_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "CourtOpeningHour" ADD CONSTRAINT "CourtOpeningHour_dayOfWeek_range" CHECK ("dayOfWeek" BETWEEN 0 AND 6);

ALTER TABLE "Court" ADD CONSTRAINT "Court_hourlyPriceCents_nonnegative" CHECK ("hourlyPriceCents" IS NULL OR "hourlyPriceCents" >= 0);

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_endTime_after_startTime" CHECK ("endTime" > "startTime");

ALTER TABLE "Match" ADD CONSTRAINT "Match_maxPlayers_positive" CHECK ("maxPlayers" > 0);

-- Um jogador não avalia a si mesmo, nem é seu próprio amigo
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_rater_not_rated" CHECK ("raterId" <> "ratedUserId");

ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requester_not_addressee" CHECK ("requesterId" <> "addresseeId");

-- =====================================================================
-- Reservas: impede que a mesma quadra tenha duas reservas ativas
-- (PENDING/CONFIRMED) com horários sobrepostos.
-- =====================================================================

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_no_overlap" EXCLUDE USING gist (
  "courtId" WITH =,
  tsrange("startTime", "endTime") WITH &&
) WHERE ("status" IN ('PENDING', 'CONFIRMED'));

-- =====================================================================
-- PostGIS: mantém "location" (geography) sincronizado com latitude/longitude
-- e indexa para buscas de proximidade (ST_DWithin / ORDER BY <->).
-- =====================================================================

CREATE OR REPLACE FUNCTION sync_court_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER court_sync_location
  BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "Court"
  FOR EACH ROW
  EXECUTE FUNCTION sync_court_location();

CREATE INDEX "Court_location_gist_idx" ON "Court" USING GIST ("location");
