-- CreateMetaTable
CREATE TABLE "meta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "meta_pkey" PRIMARY KEY ("key")
);

-- Insert initial schema version
INSERT INTO "meta" ("key", "value") VALUES ('schemaVersion', '1');
