# Salesforce Integration - Quick Start (5 minutes)

## 1️⃣ Create Connected App in Salesforce

1. Go to **Setup** → **Apps** → **App Manager** → **New Connected App**
2. Fill in:
   - **Connected App Name:** `Next.js CRM`
   - **API Name:** `NextJS_CRM`
   - **Contact Email:** your email
3. Check **Enable OAuth Settings**
4. **Callback URL:** `http://localhost:3000/api/auth/callback`
5. **OAuth Scopes:** Select these 3:
   - ✅ Full access (full)
   - ✅ Perform requests at any time (refresh_token, offline_access)
   - ✅ Access and manage your data (api)
6. Click **Save** → **Continue**
7. Copy the **Consumer Key** and **Consumer Secret**

---

## 2️⃣ Set Environment Variables

Create `.env.local` in your project root:

```bash
# Salesforce Configuration
SF_LOGIN_URL=https://login.salesforce.com
SF_CLIENT_ID=your_consumer_key_from_step_1
SF_CLIENT_SECRET=your_consumer_secret_from_step_1

# Your Salesforce credentials
SF_USERNAME=your.email@company.com
SF_PASSWORD=YourPassword
SF_SECURITY_TOKEN=YourSecurityToken
```

**Get Security Token:**
- Salesforce → **Setup** → **My Personal Information** → **Reset My Security Token**
- Check your email for the token
- If your IP is whitelisted, you can skip the security token

**For Sandbox:**
- Use `SF_LOGIN_URL=https://test.salesforce.com`

---

## 3️⃣ Test the Integration

```bash
# Start the dev server
npm run dev

# Open the test page
http://localhost:3000/dev/salesforce
```

You should see:
- ✅ A list of your Salesforce Leads
- ✅ A form to create new Leads
- ✅ No errors in the browser console

---

## 4️⃣ Use in Your App

### In an API Route:

```typescript
// app/api/my-endpoint/route.ts
import { querySalesforce, createRecord } from '@/lib/salesforce';

export async function GET() {
  const leads = await querySalesforce(
    'SELECT Id, Name, Email FROM Lead LIMIT 10'
  );
  return Response.json(leads.records);
}
```

### In a Server Component:

```typescript
// app/my-page/page.tsx
import { querySalesforce } from '@/lib/salesforce';

export default async function MyPage() {
  const leads = await querySalesforce('SELECT Id, Name FROM Lead LIMIT 5');
  
  return (
    <div>
      {leads.records.map(lead => (
        <div key={lead.Id}>{lead.Name}</div>
      ))}
    </div>
  );
}
```

### From Client Component (via API):

```typescript
// app/my-component/page.tsx
'use client';

const response = await fetch('/api/salesforce/leads');
const data = await response.json();
const leads = data.data;
```

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Invalid username, password, security token" | Append security token to password: `PASSWORD + TOKEN` |
| "Invalid client credentials" | Check `SF_CLIENT_ID` and `SF_CLIENT_SECRET` |
| "API access not enabled" | Contact Salesforce admin to enable API access |
| Empty leads list | Check if you have Leads in Salesforce |

---

## 📚 More Info

- Full documentation: `SALESFORCE_SETUP.md`
- Implementation details: `SALESFORCE_INTEGRATION_SUMMARY.md`
- Code: 
  - `lib/salesforce.ts` - Core helpers
  - `app/api/salesforce/leads/route.ts` - API example
  - `app/dev/salesforce/page.tsx` - Test page

---

**That's it! You're ready to use Salesforce in your Next.js app.** 🎉














