-- 添加评论模型
-- CreateTable
CREATE TABLE "website_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "website_reviews_userId_websiteId_key" ON "website_reviews"("userId", "websiteId");

-- AddForeignKey
ALTER TABLE "website_reviews" ADD CONSTRAINT "website_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_reviews" ADD CONSTRAINT "website_reviews_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;