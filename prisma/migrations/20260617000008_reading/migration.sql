-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "coverUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'to_read',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "difficulty" INTEGER,
    "summary" TEXT,
    "keyQuote" TEXT,
    "category" TEXT,
    "format" TEXT,
    "pageCount" INTEGER,
    "currentPage" INTEGER,
    "actionItems" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookNote" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapter" TEXT,
    "quote" TEXT,
    "note" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'highlight',
    "page" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");

-- CreateIndex
CREATE INDEX "Book_category_idx" ON "Book"("category");

-- CreateIndex
CREATE INDEX "BookNote_bookId_idx" ON "BookNote"("bookId");

-- AddForeignKey
ALTER TABLE "BookNote" ADD CONSTRAINT "BookNote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

