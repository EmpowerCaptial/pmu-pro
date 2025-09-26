-- CreateTable
CREATE TABLE "marketing_syncs" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastSync" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_syncs_platform_idx" ON "marketing_syncs"("platform");

-- CreateIndex
CREATE INDEX "marketing_syncs_status_idx" ON "marketing_syncs"("status");
