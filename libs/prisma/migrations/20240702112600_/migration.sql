/*
  Warnings:

  - You are about to drop the column `order` on the `PROBLEM_INPUT_OUTPUT` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[PROBLEM_SOURCE,PROBLEM_SOURCE_ID]` on the table `PROBLEM` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `PROBLEM_INPUT_OUTPUT_ORDER` to the `PROBLEM_INPUT_OUTPUT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PROBLEM_INPUT_OUTPUT` DROP COLUMN `order`,
    ADD COLUMN `PROBLEM_INPUT_OUTPUT_ORDER` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PROBLEM_PROBLEM_SOURCE_PROBLEM_SOURCE_ID_key` ON `PROBLEM`(`PROBLEM_SOURCE`, `PROBLEM_SOURCE_ID`);
