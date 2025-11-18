# 🚀 Deploying Lead Management System to Neon Database

This guide will help you deploy the complete Lead Management schema to your Neon database.

## Prerequisites

- ✅ Neon account created
- ✅ Database URL in your `.env.local` file
- ✅ Basic `users` table already created

## Step 1: Verify Your Database URL

Make sure your `.env.local` contains your Neon database URL:

```bash
POSTGRES_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Step 2: Run the Migration

I've created a custom migration script that will properly load your environment variables.

**Run this command in your terminal:**

```bash
cd /Users/a.bazin/Documents/faanst/my-crm-auto
pnpm db:migrate
```

This will:
1. ✅ Load your database URL from `.env.local`
2. ✅ Generate the migration files
3. ✅ Apply all schema changes to your Neon database

## What Gets Created

The migration adds these tables to your Neon database:

### 1. **Updated `leads` table**
- `qualification_status` - Tracks lead progression (nouveau, qualifié, transformé)
- `converted_to_account_id` - Links to created account
- `converted_to_opportunity_id` - Links to created opportunity
- `updated_at` - Timestamp of last update

### 2. **New `accounts` table**
Stores customer accounts converted from leads:
```sql
- id, company_name, contact_name, email, phone
- address, website, industry
- created_at, updated_at
```

### 3. **New `opportunities` table**
Sales opportunities linked to accounts:
```sql
- id, title, account_id, amount
- stage (prospection → qualification → proposition → négociation → gagné/perdu)
- probability, expected_close_date, description
- created_at, updated_at
```

### 4. **New `notes` table**
Historical notes for tracking:
```sql
- id, entity_type (lead/account/opportunity)
- entity_id, content, created_by
- created_at
```

### 5. **New `tasks` table**
Follow-up tasks with priorities:
```sql
- id, entity_type, entity_id, title, description
- due_date, status (à faire, en cours, terminé)
- priority (haute, normale, basse)
- assigned_to, created_at, completed_at
```

## Step 3: Verify Migration

After the migration completes, you can verify it worked:

### Option A: Using Neon Dashboard
1. Go to https://console.neon.tech
2. Select your project
3. Click on "Tables" in the sidebar
4. You should see: `leads`, `accounts`, `opportunities`, `notes`, `tasks`

### Option B: Using Drizzle Studio
```bash
pnpm db:studio
```
This opens a visual database browser at http://localhost:4983

## Step 4: Start Your Application

```bash
pnpm dev
```

Visit http://localhost:3000 - the error should be gone!

## Troubleshooting

### Error: "POSTGRES_URL not found"
- Check that your `.env.local` file exists
- Verify the URL format is correct
- Make sure there are no extra spaces around the `=` sign

### Error: "column already exists"
This means some migrations were partially applied. You have two options:

**Option 1: Drop and recreate (if no important data)**
Go to Neon dashboard → SQL Editor and run:
```sql
DROP TABLE IF EXISTS notes, tasks, opportunities, accounts CASCADE;
ALTER TABLE leads DROP COLUMN IF EXISTS qualification_status;
ALTER TABLE leads DROP COLUMN IF EXISTS converted_to_account_id;
ALTER TABLE leads DROP COLUMN IF EXISTS converted_to_opportunity_id;
```
Then run `pnpm db:migrate` again.

**Option 2: Manual fixes**
Check which columns/tables exist and manually add missing ones using the SQL from `MIGRATION_GUIDE.md`.

### Error: "Cannot connect to database"
- Verify your Neon database is running (not suspended)
- Check that your IP is allowed (Neon allows all by default)
- Confirm the database URL includes `?sslmode=require`

## Alternative: Manual Migration

If the automated script doesn't work, you can run the SQL manually:

1. Copy the SQL from `MIGRATION_GUIDE.md`
2. Go to Neon Console → SQL Editor
3. Paste and run the SQL commands
4. Verify tables are created

## Next Steps

Once migration is complete:

1. **Test Lead Creation**
   - Click "Add Lead" on the dashboard
   - Fill in the form and submit

2. **Test Qualification**
   - Go to `/leads`
   - Click actions (⋮) on a lead
   - Change status to "Qualifié"

3. **Test Notes & Tasks**
   - Click on a lead name
   - Add notes in the Notes tab
   - Create tasks in the Tasks tab

4. **Test Conversion**
   - Qualify a lead first
   - Click "Convertir en compte"
   - Verify account and opportunity are created

## Database Backup

Before making any changes, it's good practice to backup:

In Neon Console:
1. Go to your project
2. Click "Branches"
3. Create a new branch (this creates a copy)

## Support

If you encounter issues:
- Check the Neon logs in the console
- Review `MIGRATION_GUIDE.md` for detailed SQL
- Check `IMPLEMENTATION_CHECKLIST.md` for complete feature list

---

**Ready to deploy?** Run: `pnpm db:migrate` 🚀





