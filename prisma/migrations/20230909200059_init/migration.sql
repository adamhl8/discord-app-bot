-- CreateTable
CREATE TABLE "GuildSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officerRoleId" TEXT NOT NULL,
    "applicantRoleId" TEXT NOT NULL,
    "appsChannelId" TEXT NOT NULL,
    "appsCategoryId" TEXT NOT NULL,
    "declineMessage" TEXT NOT NULL,
    "postLogs" BOOLEAN NOT NULL,
    "postLogsChannelId" TEXT
);

-- CreateTable
CREATE TABLE "Applicant" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "appMessageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "memberId" TEXT,
    "declineMessageId" TEXT,
    "kick" BOOLEAN,
    "warcraftlogs" TEXT,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "Applicant_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildSettings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
