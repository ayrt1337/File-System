/*
  Warnings:

  - Made the column `email` on table `tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tokens" ALTER COLUMN "email" SET NOT NULL;
