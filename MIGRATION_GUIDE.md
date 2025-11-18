# Lead Management System - Migration Guide

## Overview
This guide explains how to set up the new Lead Management system with qualification, conversion, and history features.

## Database Schema Updates

The following new features have been added:

### 1. **Updated Leads Table**
- Added `qualificationStatus` field with values: `nouveau`, `qualifie`, `transforme`
- Added `convertedToAccountId` and `convertedToOpportunityId` for tracking conversions
- Added `updatedAt` timestamp

### 2. **New Tables**
- **Accounts**: Store converted leads as customer accounts
- **Opportunities**: Sales opportunities linked to accounts
- **Notes**: History tracking for leads, accounts, and opportunities
- **Tasks**: Follow-up tasks with due dates and priorities

## Migration Steps

### Option 1: Using Drizzle Kit (Recommended)

1. Make sure your `.env` file has the `POSTGRES_URL` variable set

2. Generate the migration:
```bash
cd my-crm-auto
npx drizzle-kit generate
```

3. Apply the migration:
```bash
npx drizzle-kit push
```

### Option 2: Manual SQL (if needed)

If you prefer to run SQL directly, here are the main changes:

```sql
-- Add new enums
CREATE TYPE qualification_status AS ENUM ('nouveau', 'qualifie', 'transforme');
CREATE TYPE opportunity_stage AS ENUM ('prospection', 'qualification', 'proposition', 'negociation', 'gagne', 'perdu');
CREATE TYPE task_status AS ENUM ('a_faire', 'en_cours', 'termine');

-- Update leads table
ALTER TABLE leads ADD COLUMN qualification_status qualification_status NOT NULL DEFAULT 'nouveau';
ALTER TABLE leads ADD COLUMN converted_to_account_id INTEGER;
ALTER TABLE leads ADD COLUMN converted_to_opportunity_id INTEGER;
ALTER TABLE leads ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Create accounts table
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  website TEXT,
  industry TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create opportunities table
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  account_id INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  stage opportunity_stage NOT NULL DEFAULT 'prospection',
  probability INTEGER NOT NULL DEFAULT 0,
  expected_close_date TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  status task_status NOT NULL DEFAULT 'a_faire',
  priority TEXT NOT NULL DEFAULT 'normale',
  assigned_to TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

## Features Implemented

### 1. **Lead Qualification Workflow**
- Three statuses: Nouveau → Qualifié → Transformé
- Status can be changed from the leads table via dropdown menu
- Visual badges indicate current status

### 2. **Lead Conversion**
- Convert qualified leads to accounts and opportunities
- Automatic linking between lead, account, and opportunity
- Conversion information displayed on lead detail page

### 3. **History Tracking**
- **Notes**: Add timestamped notes to any lead
- **Tasks**: Create follow-up tasks with:
  - Title and description
  - Due dates
  - Priority levels (haute, normale, basse)
  - Status tracking (à faire, en cours, terminé)

## Navigation

The system adds a new "Leads" section accessible from:
- Main navigation sidebar (Target icon)
- Dashboard "View All Leads" button
- Direct URL: `/leads`

## Pages Structure

```
/leads                    → Leads list with filtering by qualification status
/leads/[id]              → Lead detail page with history (notes & tasks)
```

## Next Steps

1. Run the database migration
2. Test the lead creation flow
3. Try qualifying leads (nouveau → qualifié)
4. Convert a qualified lead to an account
5. Add notes and tasks to track follow-ups

## Troubleshooting

### Issue: Migration fails
- Ensure your `POSTGRES_URL` environment variable is set correctly
- Check database connection
- Verify you have permissions to alter tables

### Issue: Existing leads not showing qualification status
- Old leads will automatically get the default status "nouveau"
- You can update them via the UI

## Future Enhancements

Consider adding:
- Email notifications for task due dates
- Bulk actions for lead management
- Advanced filtering and search
- Reports and analytics
- Integration with external CRM systems






