-- CreateTable
CREATE TABLE IF NOT EXISTS "client_bookings" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "procedureDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "contactId" TEXT,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_bookingDate_idx" ON "client_bookings"("bookingDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_procedureDate_idx" ON "client_bookings"("procedureDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_status_idx" ON "client_bookings"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "client_bookings_contactId_idx" ON "client_bookings"("contactId");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_contactId_fkey'
    ) THEN
        ALTER TABLE "client_bookings" ADD CONSTRAINT "client_bookings_contactId_fkey" 
        FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_staffId_fkey'
    ) THEN
        ALTER TABLE "client_bookings" ADD CONSTRAINT "client_bookings_staffId_fkey" 
        FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
