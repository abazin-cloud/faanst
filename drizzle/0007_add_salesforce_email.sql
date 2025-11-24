-- Add salesforce_email column to users table
-- This allows users to have a different email in Salesforce than their login email

ALTER TABLE users ADD COLUMN salesforce_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.salesforce_email IS 'Email used in Salesforce for lead ownership filtering. If null, uses the user email.';














