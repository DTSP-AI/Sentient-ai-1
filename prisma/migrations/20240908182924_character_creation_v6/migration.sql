/*
  Warnings:

  - Added the required column `shortDescription` to the `Companion` table without a default value. This is not possible if the table is not empty.
  - Made the column `src` on table `Companion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Companion" ADD COLUMN     "shortDescription" TEXT NOT NULL,
ALTER COLUMN "src" SET NOT NULL;
