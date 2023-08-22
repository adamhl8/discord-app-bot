/*
  Warnings:

  - You are about to drop the column `applicantRole` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `appsCategory` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `appsChannel` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `officerRole` on the `Guild` table. All the data in the column will be lost.
  - Added the required column `applicantRoleId` to the `Guild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appsCategoryId` to the `Guild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appsChannelId` to the `Guild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officerRoleId` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officerRoleId" TEXT NOT NULL,
    "applicantRoleId" TEXT NOT NULL,
    "appsChannelId" TEXT NOT NULL,
    "appsCategoryId" TEXT NOT NULL,
    "declineMessage" TEXT NOT NULL,
    "postLogs" BOOLEAN NOT NULL,
    "postLogsChannel" TEXT NOT NULL
);
INSERT INTO "new_Guild" ("declineMessage", "id", "postLogs", "postLogsChannel") SELECT "declineMessage", "id", "postLogs", "postLogsChannel" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
