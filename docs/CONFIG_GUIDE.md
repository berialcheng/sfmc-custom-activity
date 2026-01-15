# SFMC Custom Activity Configuration Guide

## Overview

This document explains the `config.json` configuration file used by Salesforce Marketing Cloud (SFMC) Journey Builder Custom Activities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SFMC Journey Builder                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           Journey Canvas                             │    │
│  │                                                                      │    │
│  │    [Entry] ──▶ [Email] ──▶ [Custom Activity] ──▶ [Wait] ──▶ [Exit]  │    │
│  │                                    │                                 │    │
│  │                            ┌───────┴───────┐                        │    │
│  │                            ▼               ▼                        │    │
│  │                       [Success]       [Failure]                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP REST Calls
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Your Custom Activity Server                           │
│                        (Deployed on Vercel)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  /execute    │  │   /save      │  │  /publish    │  │   /stop      │     │
│  │  (runtime)   │  │  (config)    │  │  (lifecycle) │  │  (cleanup)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Configuration File Structure

### 1. Basic Information

```json
{
  "workflowApiVersion": "1.1",
  "type": "REST"
}
```

| Field | Description |
|-------|-------------|
| `workflowApiVersion` | Journey Builder API version. Use `"1.1"` for current version. |
| `type` | Activity type. `"REST"` means the activity communicates via HTTP REST API. |

### 2. Metadata

```json
"metaData": {
  "icon": "https://your-domain.com/images/icon.png",
  "category": "custom"
}
```

| Field | Description |
|-------|-------------|
| `icon` | URL to the activity icon (40x40 PNG recommended). Displayed on the Journey canvas. |
| `category` | Category in the activity palette. Options: `custom`, `message`, `advertising`, `flow`. |

### 3. Language Support

```json
"lang": {
  "en-US": {
    "name": "Custom Activity",
    "description": "A custom activity for Journey Builder"
  },
  "zh-CN": {
    "name": "自定义活动",
    "description": "Journey Builder 的自定义活动"
  }
}
```

Provides localized names and descriptions for different languages.

### 4. Execute Arguments (Core)

```json
"arguments": {
  "execute": {
    "inArguments": [...],
    "outArguments": [...],
    "timeout": 100000,
    "retryCount": 3,
    "retryDelay": 10000,
    "concurrentRequests": 5,
    "url": "https://your-domain.com/api/activity/execute"
  }
}
```

#### 4.1 inArguments (Input Parameters)

Data passed FROM SFMC TO your API when the activity executes.

```json
"inArguments": [
  {"contactKey": "{{Contact.Key}}"},
  {"emailAddress": "{{InteractionDefaults.Email}}"},
  {"customField1": ""},
  {"customField2": ""}
]
```

**SFMC Data Binding Expressions:**

| Expression | Description |
|------------|-------------|
| `{{Contact.Key}}` | Unique contact identifier |
| `{{Contact.Id}}` | Contact ID |
| `{{InteractionDefaults.Email}}` | Contact's email address |
| `{{Contact.Attribute.DEName.FieldName}}` | Data Extension field value |
| `{{Event.EventName.FieldName}}` | Event data field |

#### 4.2 outArguments (Output Parameters)

Data returned FROM your API TO SFMC. Can be used in subsequent activities.

```json
"outArguments": [
  {"result": ""}
]
```

#### 4.3 Execution Settings

| Field | Description |
|-------|-------------|
| `timeout` | Request timeout in milliseconds (max: 100000) |
| `retryCount` | Number of retry attempts on failure (max: 5) |
| `retryDelay` | Delay between retries in milliseconds |
| `concurrentRequests` | Number of concurrent requests SFMC can make |
| `url` | Your API endpoint URL |

#### 4.4 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Journey Execution Flow                            │
└─────────────────────────────────────────────────────────────────────┘

    SFMC Contact Data                          Your Server
    ┌────────────────┐                    ┌────────────────────┐
    │ Contact.Key    │                    │                    │
    │ Email          │   POST /execute    │  /api/activity/    │
    │ Custom Fields  │ ──────────────────▶│     execute        │
    │                │    inArguments     │                    │
    │                │                    │  Process business  │
    │                │                    │  logic here...     │
    │                │   JSON Response    │                    │
    │                │ ◀────────────────  │                    │
    └────────────────┘    outArguments    └────────────────────┘
                          branchResult
```

### 5. Configuration Arguments (Lifecycle Endpoints)

```json
"configurationArguments": {
  "save": {
    "url": "https://your-domain.com/api/activity/save",
    "verb": "POST",
    "useJwt": false
  },
  "publish": {
    "url": "https://your-domain.com/api/activity/publish",
    "verb": "POST",
    "useJwt": false
  },
  "validate": {
    "url": "https://your-domain.com/api/activity/validate",
    "verb": "POST",
    "useJwt": false
  },
  "stop": {
    "url": "https://your-domain.com/api/activity/stop",
    "verb": "POST",
    "useJwt": false
  }
}
```

#### Lifecycle Events

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Activity Lifecycle                                │
└─────────────────────────────────────────────────────────────────────┘

User configures activity in UI
            │
            ▼
    ┌───────────────┐
    │     SAVE      │  ──▶  Store configuration
    └───────┬───────┘
            │
User clicks "Publish Journey"
            │
            ▼
    ┌───────────────┐
    │   VALIDATE    │  ──▶  Check configuration is valid
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │    PUBLISH    │  ──▶  Prepare for execution (warm up caches, etc.)
    └───────┬───────┘
            │
Journey runs, for each contact
            │
            ▼
    ┌───────────────┐
    │    EXECUTE    │  ──▶  Process contact (called per contact!)
    └───────┬───────┘
            │
Journey is stopped/deactivated
            │
            ▼
    ┌───────────────┐
    │     STOP      │  ──▶  Clean up resources
    └───────────────┘
```

| Endpoint | When Called | Purpose |
|----------|-------------|---------|
| `save` | User saves activity configuration | Persist custom settings |
| `validate` | Before publishing Journey | Verify configuration is valid |
| `publish` | Journey is published/activated | Initialize resources, warm up |
| `execute` | For each contact in Journey | **Core business logic** |
| `stop` | Journey is stopped/deactivated | Clean up, cancel pending tasks |

### 6. User Interface Settings

```json
"userInterfaces": {
  "configurationSupportsReadOnlyMode": true,
  "configModal": {
    "fullscreen": false,
    "height": 600,
    "width": 800
  }
}
```

| Field | Description |
|-------|-------------|
| `configurationSupportsReadOnlyMode` | Allow viewing config in read-only mode |
| `configModal.fullscreen` | Open config modal in fullscreen |
| `configModal.height` | Modal height in pixels |
| `configModal.width` | Modal width in pixels |

### 7. Schema Definition

Defines the data types for arguments. Used by SFMC for validation and data mapping.

```json
"schema": {
  "arguments": {
    "execute": {
      "inArguments": [
        {
          "contactKey": {
            "dataType": "Text",
            "isNullable": false,
            "direction": "in"
          }
        }
      ],
      "outArguments": [
        {
          "result": {
            "dataType": "Text",
            "direction": "out",
            "access": "visible"
          }
        }
      ]
    }
  }
}
```

#### Data Types

| Type | Description |
|------|-------------|
| `Text` | String value |
| `Number` | Numeric value |
| `Boolean` | True/false |
| `Date` | Date value |
| `EmailAddress` | Email address |
| `Phone` | Phone number |

#### Schema Properties

| Property | Description |
|----------|-------------|
| `dataType` | The data type (see above) |
| `isNullable` | Whether the value can be null |
| `direction` | `in` (input), `out` (output), or `inout` |
| `access` | `visible` (can be used in other activities) or `hidden` |

### 8. Outcomes (Branching)

Define possible paths after the activity executes.

```json
"outcomes": [
  {
    "arguments": {
      "branchResult": "success"
    },
    "metaData": {
      "label": "Success"
    }
  },
  {
    "arguments": {
      "branchResult": "failure"
    },
    "metaData": {
      "label": "Failure"
    }
  }
]
```

#### Branching Flow

```
                    ┌─────────────────┐
                    │ Custom Activity │
                    └────────┬────────┘
                             │
              API returns branchResult
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
       [success]        [failure]        [other]
            │                │                │
            ▼                ▼                ▼
       Send Thank       Send Error        Log &
        You Email        Notice           Exit
```

Your `/execute` API should return:

```json
{
  "branchResult": "success"
}
```

or

```json
{
  "branchResult": "failure"
}
```

## Complete Request/Response Examples

### Execute Request (from SFMC to your server)

```json
POST /api/activity/execute
Content-Type: application/json

{
  "inArguments": [
    {"contactKey": "ABC123"},
    {"emailAddress": "user@example.com"},
    {"customField1": "value1"},
    {"customField2": "value2"}
  ],
  "outArguments": [
    {"result": ""}
  ],
  "activityObjectID": "xxx-xxx-xxx",
  "journeyId": "yyy-yyy-yyy",
  "activityId": "zzz-zzz-zzz"
}
```

### Execute Response (from your server to SFMC)

```json
{
  "branchResult": "success",
  "result": "Processed successfully"
}
```

## Security Considerations

### JWT Verification (Optional)

Set `"useJwt": true` to have SFMC sign requests:

```json
"configurationArguments": {
  "save": {
    "url": "https://your-domain.com/api/activity/save",
    "verb": "POST",
    "useJwt": true
  }
}
```

Your server can then verify the JWT signature using your SFMC app's JWT secret.

### HTTPS Required

All endpoints must use HTTPS with valid SSL certificates.

### CORS Headers

Your server must return proper CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### X-Frame-Options

To allow your config UI to load in SFMC's iframe:

```
X-Frame-Options: ALLOWALL
Content-Security-Policy: frame-ancestors 'self' https://*.exacttarget.com https://*.marketingcloudapps.com
```

## References

- [SFMC Custom Activities Documentation](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/creating-activities.html)
- [Journey Builder SDK](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/jb-sdk.html)
- [Postmonger Library](https://github.com/salesforce-marketingcloud/postmonger)
