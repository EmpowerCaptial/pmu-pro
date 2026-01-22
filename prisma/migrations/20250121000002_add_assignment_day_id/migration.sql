-- AlterTable
ALTER TABLE "training_assignments" ADD COLUMN "dayId" TEXT;

-- CreateIndex
CREATE INDEX "training_assignments_dayId_idx" ON "training_assignments"("dayId");

