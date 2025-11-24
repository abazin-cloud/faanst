-- Migration: Add Salesforce ID to leads table
-- This allows tracking which leads are synchronized with Salesforce

ALTER TABLE "leads" ADD COLUMN "salesforce_id" TEXT;
ALTER TABLE "leads" ADD COLUMN "last_synced_at" TIMESTAMP;

-- Create index for faster Salesforce ID lookups
CREATE INDEX IF NOT EXISTS "idx_leads_salesforce_id" ON "leads" ("salesforce_id");

-- Add comment
COMMENT ON COLUMN "leads"."salesforce_id" IS 'Salesforce Lead ID for synchronization';
COMMENT ON COLUMN "leads"."last_synced_at" IS 'Last time this lead was synchronized with Salesforce';














