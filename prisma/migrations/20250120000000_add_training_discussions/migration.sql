-- CreateTable
CREATE TABLE "training_discussions" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_discussion_replies" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_discussion_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_discussions_programId_idx" ON "training_discussions"("programId");

-- CreateIndex
CREATE INDEX "training_discussions_userId_idx" ON "training_discussions"("userId");

-- CreateIndex
CREATE INDEX "training_discussions_createdAt_idx" ON "training_discussions"("createdAt");

-- CreateIndex
CREATE INDEX "training_discussion_replies_discussionId_idx" ON "training_discussion_replies"("discussionId");

-- CreateIndex
CREATE INDEX "training_discussion_replies_userId_idx" ON "training_discussion_replies"("userId");

-- CreateIndex
CREATE INDEX "training_discussion_replies_createdAt_idx" ON "training_discussion_replies"("createdAt");

-- AddForeignKey
ALTER TABLE "training_discussions" ADD CONSTRAINT "training_discussions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_discussion_replies" ADD CONSTRAINT "training_discussion_replies_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "training_discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_discussion_replies" ADD CONSTRAINT "training_discussion_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

