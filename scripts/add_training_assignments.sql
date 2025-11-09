ALTER TABLE "public"."users" ADD COLUMN "permissions" JSONB;

CREATE TABLE "public"."training_assignments" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDateLabel" TEXT NOT NULL,
    "dueDateISO" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimatedHours" DOUBLE PRECISION,
    "rubric" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "training_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."room_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studioName" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "serviceType" TEXT,
    "clientName" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_bookings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "training_assignments_weekId_idx" ON "public"."training_assignments"("weekId");
CREATE INDEX "room_bookings_userId_idx" ON "public"."room_bookings"("userId");
CREATE INDEX "room_bookings_studioName_idx" ON "public"."room_bookings"("studioName");
CREATE INDEX "room_bookings_bookingDate_idx" ON "public"."room_bookings"("bookingDate");
CREATE INDEX "room_bookings_startTime_idx" ON "public"."room_bookings"("startTime");
CREATE INDEX "room_bookings_status_idx" ON "public"."room_bookings"("status");

ALTER TABLE "public"."training_assignments" ADD CONSTRAINT "training_assignments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."room_bookings" ADD CONSTRAINT "room_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
