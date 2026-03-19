-- AlterTable
ALTER TABLE "files" ALTER COLUMN "lastUpdate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "inactive" SET DEFAULT false,
ALTER COLUMN "lastUpdate" DROP NOT NULL;
