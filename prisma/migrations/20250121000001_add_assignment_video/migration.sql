-- AlterTable
ALTER TABLE "training_assignments" ADD COLUMN "videoId" TEXT;

-- CreateIndex
CREATE INDEX "training_assignments_videoId_idx" ON "training_assignments"("videoId");

-- AddForeignKey
ALTER TABLE "training_assignments" ADD CONSTRAINT "training_assignments_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

