# Vercel Webhook Rate Limit Testing

This guide explains how to test Error 429 (Rate Limited) responses for the Strapi-to-Vercel webhook integration.

## Setup

### 1. Add Vercel Deploy Hook URL to .env

Add your Vercel deploy hook URL to your `.env` file:

```bash
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID
```

To get your Vercel deploy hook:
1. Go to your Vercel project settings
2. Navigate to "Git" → "Deploy Hooks"
3. Create a new deploy hook
4. Copy the URL and add it to your `.env` file

### 2. Start Strapi Server

```bash
cd backend
npm run develop
```

## Testing Methods

### Method 1: Test Simulated Rate Limit Endpoint

The easiest way to test a 429 error without actually hitting Vercel's rate limits:

```bash
# Using curl
curl http://localhost:1337/api/vercel-webhook/test-rate-limit

# Using the test script
node backend/test-rate-limit.js
```

**Expected Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "rate_limited",
    "name": "RATE_LIMITED",
    "message": "Test simulation: Rate limit exceeded",
    "status": 429,
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": 1736246400000
    }
  }
}
```

### Method 2: Trigger Actual Vercel Deployment

To trigger a real Vercel deployment:

```bash
curl -X POST http://localhost:1337/api/vercel-webhook/trigger
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Deployment triggered successfully",
  "data": {
    "job": {
      "id": "...",
      "state": "PENDING"
    }
  }
}
```

**Rate Limited Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded for Vercel deploy hook",
    "status": 429,
    "data": {
      "error": {
        "code": "rate_limited",
        "message": "Rate limit exceeded"
      }
    }
  }
}
```

### Method 3: Run Automated Test Script

The test script includes multiple testing scenarios:

```bash
node backend/test-rate-limit.js
```

This will:
1. Test the simulated rate limit endpoint
2. Trigger 5 sequential webhook calls
3. (Optional) Rapid-fire parallel requests

## API Endpoints

### POST `/api/vercel-webhook/trigger`
Triggers a Vercel deployment via the configured deploy hook.

**Response Codes:**
- `200`: Deployment triggered successfully
- `400`: Missing `VERCEL_DEPLOY_HOOK_URL` configuration
- `429`: Rate limit exceeded
- `500`: Internal server error

### GET `/api/vercel-webhook/test-rate-limit`
Returns a simulated 429 rate limit error for testing purposes.

**Response Code:**
- `429`: Always returns rate limited error

## Vercel Rate Limits

Vercel deploy hooks typically have rate limits:
- **Free/Hobby plans**: ~100 deployments per day
- **Pro plans**: Higher limits
- **Rate limit window**: Usually resets every 24 hours

To actually trigger a real 429 error from Vercel, you would need to:
1. Make many rapid deployment requests
2. Exceed your plan's deployment quota

⚠️ **Warning**: Repeatedly triggering real deployments can consume your Vercel quota and trigger actual rate limits!

## Integration with Strapi Lifecycle Hooks

To automatically trigger Vercel deployments when content changes, you can add lifecycle hooks to your content types:

```typescript
// Example: backend/src/api/home-page/content-types/home-page/lifecycles.ts
export default {
  async afterUpdate(event) {
    const { strapi } = event.state;

    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

    if (deployHookUrl) {
      try {
        await fetch(deployHookUrl, { method: 'POST' });
        strapi.log.info('Vercel deployment triggered');
      } catch (error) {
        strapi.log.error('Failed to trigger Vercel deployment:', error);
      }
    }
  },
};
```

## Troubleshooting

### No rate limit errors when testing
- The simulated endpoint will always return 429
- Real Vercel webhooks only return 429 when you exceed their limits
- Vercel's rate limits are quite generous for normal use

### VERCEL_DEPLOY_HOOK_URL not configured
- Add the environment variable to your `.env` file
- Restart the Strapi server after adding the variable

### 500 Internal Server Error
- Check Strapi logs for detailed error messages
- Verify the deploy hook URL is correct
- Ensure network connectivity to Vercel API
