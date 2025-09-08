-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('ID_DOCUMENT', 'CONSENT_FORM', 'WAIVER', 'INTAKE_FORM', 'CONTRAINDICATION_FORM', 'ANALYSIS_REPORT', 'PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CalendarProvider" AS ENUM ('CALENDLY', 'ACUITY_SCHEDULING', 'GOOGLE_CALENDAR', 'OUTLOOK_CALENDAR', 'BOOKLY', 'SIMPLYBOOK_ME', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."SyncDirection" AS ENUM ('IMPORT_ONLY', 'EXPORT_ONLY', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "public"."DepositStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DeletionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT,
    "licenseNumber" TEXT NOT NULL,
    "licenseState" TEXT NOT NULL,
    "yearsExperience" TEXT,
    "selectedPlan" TEXT NOT NULL DEFAULT 'pro',
    "licenseFile" TEXT,
    "insuranceFile" TEXT,
    "hasActiveSubscription" BOOLEAN NOT NULL DEFAULT false,
    "isLicenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'artist',
    "stripeId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "emergencyContact" TEXT,
    "medicalHistory" TEXT,
    "allergies" TEXT,
    "skinType" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."photos" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "lighting" TEXT,
    "quality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."intakes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "medications" TEXT NOT NULL,
    "notes" TEXT,
    "result" TEXT,
    "rationale" TEXT,
    "flaggedItems" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analyses" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "photoId" TEXT,
    "fitzpatrick" INTEGER,
    "undertone" TEXT,
    "confidence" DOUBLE PRECISION,
    "recommendation" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pigments" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseTone" TEXT NOT NULL,
    "hueNotes" TEXT NOT NULL,
    "opacity" TEXT NOT NULL,
    "idealFitz" TEXT NOT NULL,
    "tempShift" TEXT,
    "useCase" TEXT NOT NULL,
    "hexPreview" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pigments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."magic_link_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_link_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filename" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."procedures" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "procedureType" TEXT NOT NULL,
    "voltage" DOUBLE PRECISION NOT NULL,
    "needleConfiguration" TEXT NOT NULL,
    "pigmentBrand" TEXT NOT NULL,
    "pigmentColor" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "depth" TEXT,
    "duration" INTEGER,
    "areaTreated" TEXT,
    "notes" TEXT,
    "procedureDate" TIMESTAMP(3) NOT NULL,
    "followUpDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meta_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "pageAccessToken" TEXT NOT NULL,
    "pageTokenExpiresAt" TIMESTAMP(3),
    "igUserId" TEXT,
    "igUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meta_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calendar_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."CalendarProvider" NOT NULL,
    "providerName" TEXT NOT NULL,
    "apiKey" TEXT,
    "webhookUrl" TEXT,
    "calendarId" TEXT,
    "calendarName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncDirection" "public"."SyncDirection" NOT NULL DEFAULT 'BIDIRECTIONAL',
    "lastSyncAt" TIMESTAMP(3),
    "syncFrequency" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deposit_payments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "remainingAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."DepositStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeSessionId" TEXT,
    "depositLink" TEXT NOT NULL,
    "depositLinkExpiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(65,30),
    "refundReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_deletion_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "status" "public"."DeletionStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketing_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT,
    "accountName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenMetaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketing_leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "plan" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeId_key" ON "public"."users"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "pigments_brand_name_key" ON "public"."pigments"("brand", "name");

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_tokens_token_key" ON "public"."magic_link_tokens"("token");

-- CreateIndex
CREATE INDEX "meta_connections_userId_idx" ON "public"."meta_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "meta_connections_userId_pageId_key" ON "public"."meta_connections"("userId", "pageId");

-- CreateIndex
CREATE INDEX "calendar_integrations_userId_idx" ON "public"."calendar_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_integrations_userId_provider_calendarId_key" ON "public"."calendar_integrations"("userId", "provider", "calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_payments_depositLink_key" ON "public"."deposit_payments"("depositLink");

-- CreateIndex
CREATE INDEX "deposit_payments_clientId_idx" ON "public"."deposit_payments"("clientId");

-- CreateIndex
CREATE INDEX "deposit_payments_userId_idx" ON "public"."deposit_payments"("userId");

-- CreateIndex
CREATE INDEX "deposit_payments_depositLink_idx" ON "public"."deposit_payments"("depositLink");

-- CreateIndex
CREATE INDEX "deposit_payments_status_idx" ON "public"."deposit_payments"("status");

-- CreateIndex
CREATE INDEX "data_deletion_requests_email_idx" ON "public"."data_deletion_requests"("email");

-- CreateIndex
CREATE INDEX "data_deletion_requests_status_idx" ON "public"."data_deletion_requests"("status");

-- CreateIndex
CREATE INDEX "marketing_connections_userId_idx" ON "public"."marketing_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_connections_userId_platform_key" ON "public"."marketing_connections"("userId", "platform");

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."photos" ADD CONSTRAINT "photos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."intakes" ADD CONSTRAINT "intakes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analyses" ADD CONSTRAINT "analyses_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "public"."photos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analyses" ADD CONSTRAINT "analyses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."magic_link_tokens" ADD CONSTRAINT "magic_link_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."procedures" ADD CONSTRAINT "procedures_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meta_connections" ADD CONSTRAINT "meta_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendar_integrations" ADD CONSTRAINT "calendar_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deposit_payments" ADD CONSTRAINT "deposit_payments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deposit_payments" ADD CONSTRAINT "deposit_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
