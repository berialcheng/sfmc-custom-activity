# SFMC Custom Activity

A Salesforce Marketing Cloud Engagement Custom Activity template built with Next.js, deployable on Vercel.

## Project Structure

```
custom-activity/
├── app/
│   ├── api/activity/           # API endpoints
│   │   ├── execute/            # Called when Journey runs
│   │   ├── save/               # Save configuration
│   │   ├── publish/            # Called when Journey is published
│   │   ├── validate/           # Validate configuration
│   │   └── stop/               # Called when Journey stops
│   ├── page.tsx                # Configuration UI main page
│   ├── layout.tsx
│   └── globals.css
├── public/
│   └── config.json             # Activity definition config
├── lib/
│   ├── postmonger.ts           # Postmonger SDK wrapper
│   └── types.ts                # TypeScript type definitions
├── components/
│   └── ActivityConfig.tsx      # Configuration form component
└── vercel.json                 # Vercel deployment config
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development

```bash
npm run dev
```

Visit http://localhost:3000 to view the configuration interface.

### 3. Configure config.json

Edit `public/config.json` and replace `{{ENDPOINT_BASE}}` with your actual deployment URL:

```json
{
  "arguments": {
    "execute": {
      "url": "https://your-app.vercel.app/api/activity/execute"
    }
  }
}
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Installing in SFMC

### Method 1: Using Package Manager

1. Log in to Marketing Cloud
2. Go to **Setup** > **Apps** > **Installed Packages**
3. Click **New** to create a new Package
4. Add a **Journey Builder Activity** component
5. Fill in the configuration:
   - **Endpoint URL**: `https://your-app.vercel.app`
   - **Config URL**: `https://your-app.vercel.app/config.json`

### Method 2: Direct config.json Configuration

Ensure all URLs in `public/config.json` point to the correct endpoints.

## Custom Development

### Modifying Execution Logic

Edit `app/api/activity/execute/route.ts` to add your business logic:

```typescript
// Example: Call an external API
const response = await fetch('https://your-api.com/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contactKey: args.contactKey,
    email: args.emailAddress,
    customData: args.customField1,
  }),
});
```

### Adding New Configuration Fields

1. Update the `CustomActivityState` interface in `lib/types.ts`
2. Add form fields in `components/ActivityConfig.tsx`
3. Update `inArguments` and `schema` in `public/config.json`

### Adding Data Bindings

Use SFMC expressions in the `inArguments` section of `config.json`:

```json
{
  "inArguments": [
    { "contactKey": "{{Contact.Key}}" },
    { "email": "{{InteractionDefaults.Email}}" },
    { "firstName": "{{Contact.Attribute.MyDE.FirstName}}" }
  ]
}
```

## Testing

### Local API Testing

```bash
# Test the execute endpoint
curl -X POST http://localhost:3000/api/activity/execute \
  -H "Content-Type: application/json" \
  -d '{"inArguments": [{"contactKey": "test123"}]}'
```

### SFMC Integration Testing with ngrok

```bash
# Install ngrok
npm i -g ngrok

# Expose local server
ngrok http 3000
```

Use the ngrok URL for SFMC testing.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SFMC_JWT_SECRET` | JWT secret (for validating SFMC requests, optional) |
| `NEXT_PUBLIC_APP_URL` | Application deployment URL |

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Postmonger** - Journey Builder communication

## Reference Documentation

- [SFMC Custom Activities](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/creating-activities.html)
- [Journey Builder SDK](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/jb-sdk.html)
- [Postmonger](https://github.com/salesforce-marketingcloud/postmonger)
