/*
  Warnings:

  - You are about to drop the `tokens` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maxAge` to the `cookies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cookies" ADD COLUMN     "maxAge" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "tokens";
