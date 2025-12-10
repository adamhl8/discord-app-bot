/*
  Warnings:

  - You are about to drop the column `officerRoleId` on the `GuildSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officerRoleIds" TEXT,
    "applicantRoleId" TEXT,
    "appsChannelId" TEXT,
    "appsCategoryId" TEXT,
    "declineMessage" TEXT,
    "postLogs" BOOLEAN,
    "postLogsChannelId" TEXT
);
INSERT INTO "new_GuildSettings" ("applicantRoleId", "appsCategoryId", "appsChannelId", "declineMessage", "id", "postLogs", "postLogsChannelId") SELECT "applicantRoleId", "appsCategoryId", "appsChannelId", "declineMessage", "id", "postLogs", "postLogsChannelId" FROM "GuildSettings";
DROP TABLE "GuildSettings";
ALTER TABLE "new_GuildSettings" RENAME TO "GuildSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
