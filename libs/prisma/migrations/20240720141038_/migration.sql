/*
  Warnings:

  - You are about to drop the column `USER_OAUTH_TOKEN` on the `USER_OAUTH` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[USER_OAUTH_ID,USER_OAUTH_PROVIDER]` on the table `USER_OAUTH` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `USER_OAUTH_ID` to the `USER_OAUTH` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `USER_OAUTH_USER_OAUTH_PROVIDER_USER_NO_key` ON `USER_OAUTH`;

-- DropIndex
DROP INDEX `USER_OAUTH_USER_OAUTH_PROVIDER_USER_OAUTH_TOKEN_idx` ON `USER_OAUTH`;

-- AlterTable
ALTER TABLE `USER_OAUTH` DROP COLUMN `USER_OAUTH_TOKEN`,
    ADD COLUMN `USER_OAUTH_ID` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `USER_OAUTH_USER_OAUTH_ID_USER_OAUTH_PROVIDER_idx` ON `USER_OAUTH`(`USER_OAUTH_ID`, `USER_OAUTH_PROVIDER`);

-- CreateIndex
CREATE UNIQUE INDEX `USER_OAUTH_USER_OAUTH_ID_USER_OAUTH_PROVIDER_key` ON `USER_OAUTH`(`USER_OAUTH_ID`, `USER_OAUTH_PROVIDER`);
