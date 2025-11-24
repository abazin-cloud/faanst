# Salesforce Integration Setup Guide

## Environment Variables

Add these variables to your `.env.local` file:

### Method 1: Username-Password Flow (Recommended for Development)

```bash
# Salesforce Login URL
SF_LOGIN_URL=https://login.salesforce.com
# For sandbox environments, use: https://test.salesforce.com

# Connected App Credentials
SF_CLIENT_ID=your_connected_app_consumer_key
SF_CLIENT_SECRET=your_connected_app_consumer_secret

# User Credentials
SF_USERNAME=your_salesforce_username@company.com
SF_PASSWORD=your_salesforce_password
SF_SECURITY_TOKEN=your_security_token_if_required
```

**Note:** The security token is required if your IP is not whitelisted in Salesforce.  
Get it from: **Setup > My Personal Information > Reset My Security Token**

---

### Method 2: Refresh Token Flow (Recommended for Production)

```bash
# Salesforce Login URL
SF_LOGIN_URL=https://login.salesforce.com

# Connected App Credentials
SF_CLIENT_ID=your_connected_app_consumer_key
SF_CLIENT_SECRET=your_connected_app_consumer_secret

# Refresh Token (more secure, no password needed)
SF_REFRESH_TOKEN=your_refresh_token_here
```

If `SF_REFRESH_TOKEN` is set, username/password won't be used.

---

## Creating a Connected App in Salesforce

1. **Navigate to Setup**
   - In Salesforce, go to: **Setup > Apps > App Manager**
   - Click **New Connected App**

2. **Basic Information**
   - Connected App Name: `Next.js CRM Integration`
   - API Name: `NextJS_CRM_Integration`
   - Contact Email: your email

3. **Enable OAuth Settings**
   - Check **Enable OAuth Settings**
   - Callback URL: `http://localhost:3000/api/auth/callback`
   - For production, add your production URL

4. **Select OAuth Scopes**
   - **Full access (full)**
   - **Perform requests at any time (refresh_token, offline_access)**
   - **Access and manage your data (api)**

5. **Save and Get Credentials**
   - Click **Save**
   - Click **Continue**
   - Copy the **Consumer Key** → This is your `SF_CLIENT_ID`
   - Click **Click to reveal** next to Consumer Secret → This is your `SF_CLIENT_SECRET`

6. **Manage Connected App (Optional)**
   - Go to **Setup > Apps > Connected Apps > Manage Connected Apps**
   - Click on your app
   - Click **Edit Policies**
   - Set **Permitted Users** to **All users may self-authorize**
   - Set **IP Relaxation** to **Relax IP restrictions**
   - Save

---

## Getting a Refresh Token

### Option 1: Using Salesforce CLI (easiest)

```bash
# Install Salesforce CLI
npm install -g @salesforce/cli

# Authenticate
sf org login web --alias myorg

# Get the refresh token
sf org display --target-org myorg --verbose
```

Copy the **Refresh Token** value.

### Option 2: Using OAuth Web Server Flow

1. Build this URL (replace placeholders):
```
https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/auth/callback&scope=full%20refresh_token%20offline_access%20api
```

2. Open it in your browser and authorize
3. You'll be redirected with a `code` parameter
4. Exchange the code for tokens:

```bash
curl -X POST https://login.salesforce.com/services/oauth2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=CODE_FROM_STEP_3" \
  -d "redirect_uri=http://localhost:3000/api/auth/callback"
```

5. Copy the `refresh_token` from the response

---

## Testing the Integration

1. **Set environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Salesforce credentials
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open the test page**
   ```
   http://localhost:3000/dev/salesforce
   ```

4. **Test operations**
   - View existing Leads from Salesforce
   - Create a new Lead
   - Verify the Lead appears in Salesforce

---

## Troubleshooting

### "Invalid username, password, security token"
- Verify your credentials are correct
- If using password flow, make sure to append the security token to your password
- Check if your IP is whitelisted or add the security token

### "Invalid client credentials"
- Verify `SF_CLIENT_ID` and `SF_CLIENT_SECRET` are correct
- Make sure the Connected App is properly configured

### "Refresh token invalid"
- The refresh token may have expired
- Generate a new one using the steps above

### "API access not enabled"
- Your Salesforce user needs API access
- Contact your Salesforce administrator

### Testing with Sandbox
- Use `SF_LOGIN_URL=https://test.salesforce.com`
- Use sandbox credentials

---

## Security Best Practices

✅ **DO:**
- Store credentials in `.env.local` (never commit to git)
- Use refresh token flow in production
- Rotate credentials regularly
- Use IP whitelisting when possible

❌ **DON'T:**
- Commit credentials to version control
- Expose credentials in client-side code
- Share credentials in plain text

---

## API Documentation

See the following files for usage:
- `lib/salesforce.ts` - Core REST API helpers
- `lib/salesforce-types.ts` - TypeScript types
- `app/api/salesforce/leads/route.ts` - Example API route

### Available Helper Functions

```typescript
import { 
  querySalesforce, 
  createRecord, 
  updateRecord, 
  deleteRecord,
  getRecord 
} from '@/lib/salesforce';

// Query records
const leads = await querySalesforce('SELECT Id, Name FROM Lead LIMIT 10');

// Create a record
const newLead = await createRecord('Lead', { 
  LastName: 'Doe', 
  Company: 'Acme Corp' 
});

// Update a record
await updateRecord('Lead', leadId, { Status: 'Qualified' });

// Get a single record
const lead = await getRecord('Lead', leadId);

// Delete a record
await deleteRecord('Lead', leadId);
```














