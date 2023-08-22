-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officerRole" TEXT NOT NULL,
    "applicantRole" TEXT NOT NULL,
    "appsChannel" TEXT NOT NULL,
    "appsCategory" TEXT NOT NULL,
    "declineMessage" TEXT NOT NULL,
    "postLogs" BOOLEAN NOT NULL,
    "postLogsChannel" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Applicant" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "appMessageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "warcraftlogs" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kick" BOOLEAN NOT NULL,
    "declineMessageId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "Applicant_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
