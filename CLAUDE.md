# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SFMC Custom Activity template for Salesforce Marketing Cloud Journey Builder. Built with Next.js 14, deployed on Vercel. Uses Postmonger SDK for iframe communication with Journey Builder.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run lint     # Run Next.js linting
npm start        # Start production server
```

**Note:** Use `npm install --legacy-peer-deps` if you encounter peer dependency conflicts.

## Architecture

### API Lifecycle Endpoints (`app/api/activity/`)

SFMC calls these endpoints at different points in the Journey lifecycle:

- **execute/** - Core business logic, called per contact when journey runs. Returns `branchResult` for path selection.
- **save/** - Called when user saves activity config in Journey Builder
- **validate/** - Called before journey publish to validate configuration
- **publish/** - Called when journey is activated
- **stop/** - Called when journey is deactivated

### Key Files

- `lib/postmonger.ts` - `JourneyBuilderConnection` class wraps Postmonger SDK for iframe communication
- `lib/types.ts` - TypeScript interfaces for all SFMC request/response types
- `components/ActivityConfig.tsx` - Configuration UI component with dev mode support
- `public/config.json` - SFMC activity definition (endpoints, inArguments, schema)
- `middleware.ts` - Strips trailing slashes from API routes

### Data Flow

1. User configures activity in Journey Builder UI (loads `page.tsx` in iframe)
2. `ActivityConfig.tsx` communicates with Journey Builder via Postmonger
3. Configuration saved to SFMC's activity object (no server-side storage)
4. On journey execution, SFMC calls `/api/activity/execute` with contact data

### SFMC Data Bindings

In `config.json`, use expressions like:
- `{{Contact.Key}}` - Contact identifier
- `{{InteractionDefaults.Email}}` - Email address
- `{{Contact.Attribute.DataExtension.FieldName}}` - Custom fields

## Customization Points

1. **Business logic:** Modify `app/api/activity/execute/route.ts`
2. **UI fields:** Add to `components/ActivityConfig.tsx` and `lib/types.ts` (CustomActivityState interface)
3. **SFMC parameters:** Update `public/config.json` inArguments and schema
4. **Validation rules:** Implement in `app/api/activity/validate/route.ts`

## Security Notes

- CORS is wide open (`*`) - required for SFMC cross-origin access
- JWT verification disabled by default (`useJwt: false` in config.json)
- CSP restricts iframe embedding to SFMC domains only
- All production endpoints must use HTTPS

## Testing

Local API testing:
```bash
curl -X POST http://localhost:3000/api/activity/execute \
  -H "Content-Type: application/json" \
  -d '{"inArguments": [{"contactKey": "test123"}]}'
```

For SFMC integration testing, use ngrok to expose localhost.

## Deployment

Update all URLs in `public/config.json` to match your deployment domain before installing in SFMC.
