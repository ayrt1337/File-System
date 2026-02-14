-- CreateTable
CREATE TABLE "cookies" (
    "id" SERIAL NOT NULL,
    "cookie" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "cookies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cookies_cookie_key" ON "cookies"("cookie");

-- AddForeignKey
ALTER TABLE "cookies" ADD CONSTRAINT "cookies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
