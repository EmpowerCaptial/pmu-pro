-- CreateTable
CREATE TABLE "week_video_assignments" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "week_video_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "week_video_assignments_weekId_idx" ON "week_video_assignments"("weekId");

-- CreateIndex
CREATE INDEX "week_video_assignments_videoId_idx" ON "week_video_assignments"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "week_video_assignments_weekId_videoId_key" ON "week_video_assignments"("weekId", "videoId");

-- AddForeignKey
ALTER TABLE "week_video_assignments" ADD CONSTRAINT "week_video_assignments_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "file_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "week_video_assignments" ADD CONSTRAINT "week_video_assignments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

