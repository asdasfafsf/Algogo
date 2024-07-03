/*
  Warnings:

  - The primary key for the `PROBLEM_INPUT_OUTPUT` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `PROBLEM_INPUT_OUTPUT_NO` on the `PROBLEM_INPUT_OUTPUT` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[PROBLEM_NO]` on the table `PROBLEM_INPUT_OUTPUT` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `PROBLEM_INPUT_OUTPUT_PROBLEM_INPUT_OUTPUT_NO_PROBLEM_NO_key` ON `PROBLEM_INPUT_OUTPUT`;

-- AlterTable
ALTER TABLE `PROBLEM_INPUT_OUTPUT` DROP PRIMARY KEY,
    DROP COLUMN `PROBLEM_INPUT_OUTPUT_NO`,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `PROBLEM_INPUT_OUTPUT_PROBLEM_NO_key` ON `PROBLEM_INPUT_OUTPUT`(`PROBLEM_NO`);
