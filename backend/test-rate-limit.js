/**
 * Test script to trigger Error 429 (Rate Limited) for Vercel webhook
 *
 * Usage:
 * 1. Start your Strapi server: npm run develop
 * 2. Run this script: node test-rate-limit.js
 */

const BASE_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function testRateLimitEndpoint() {
  console.log('\n🧪 Testing Rate Limit Simulation Endpoint...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/vercel-webhook/test-rate-limit`);
    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 429) {
      console.log('\n✅ Successfully triggered Error 429 (Rate Limited)');
    } else {
      console.log('\n❌ Expected status 429, got', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function triggerVercelWebhookMultipleTimes(count = 5) {
  console.log(`\n🚀 Triggering Vercel webhook ${count} times to test rate limiting...\n`);

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHookUrl) {
    console.log('⚠️  VERCEL_DEPLOY_HOOK_URL not set. Skipping actual webhook calls.');
    console.log('   To test with real Vercel webhook, set VERCEL_DEPLOY_HOOK_URL environment variable.\n');
    return;
  }

  const results = [];

  for (let i = 0; i < count; i++) {
    try {
      console.log(`Request ${i + 1}/${count}...`);
      const startTime = Date.now();

      const response = await fetch(`${BASE_URL}/api/vercel-webhook/trigger`, {
        method: 'POST'
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      results.push({
        request: i + 1,
        status: response.status,
        duration: `${duration}ms`,
        success: data.success,
        error: data.error
      });

      console.log(`  → Status: ${response.status} (${duration}ms)`);

      if (response.status === 429) {
        console.log('  ⚠️  Rate limit hit!');
        console.log('  Error:', JSON.stringify(data.error, null, 2));
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ Request ${i + 1} failed:`, error.message);
      results.push({
        request: i + 1,
        error: error.message
      });
    }
  }

  console.log('\n📊 Results Summary:');
  console.log('='.repeat(50));
  results.forEach(result => {
    const status = result.status === 429 ? '🔴 RATE LIMITED' :
                   result.status === 200 ? '✅ SUCCESS' :
                   '⚠️  ERROR';
    console.log(`Request ${result.request}: ${status} (${result.status || 'N/A'})`);
  });

  const rateLimited = results.filter(r => r.status === 429).length;
  if (rateLimited > 0) {
    console.log(`\n✅ Successfully triggered ${rateLimited} rate limit error(s)`);
  }
}

async function simulateRapidFireRequests() {
  console.log('\n⚡ Simulating rapid-fire requests to trigger rate limit...\n');

  const promises = [];
  const requestCount = 20;

  for (let i = 0; i < requestCount; i++) {
    promises.push(
      fetch(`${BASE_URL}/api/vercel-webhook/trigger`, {
        method: 'POST'
      })
      .then(async response => ({
        request: i + 1,
        status: response.status,
        data: await response.json()
      }))
      .catch(error => ({
        request: i + 1,
        error: error.message
      }))
    );
  }

  const results = await Promise.all(promises);

  console.log('📊 Rapid-fire Results:');
  console.log('='.repeat(50));

  const statusCounts = {};
  results.forEach(result => {
    const status = result.status || 'Error';
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (result.status === 429) {
      console.log(`Request ${result.request}: 🔴 RATE LIMITED`);
    }
  });

  console.log('\nStatus Distribution:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} requests`);
  });

  if (statusCounts['429']) {
    console.log(`\n✅ Successfully triggered ${statusCounts['429']} rate limit error(s)`);
  }
}

// Main execution
async function main() {
  console.log('═'.repeat(60));
  console.log('  Vercel Webhook Rate Limit Testing Script');
  console.log('═'.repeat(60));

  // Test 1: Simulated rate limit endpoint
  await testRateLimitEndpoint();

  console.log('\n' + '─'.repeat(60) + '\n');

  // Test 2: Sequential webhook triggers
  await triggerVercelWebhookMultipleTimes(5);

  console.log('\n' + '─'.repeat(60) + '\n');

  // Test 3: Rapid-fire parallel requests
  // Uncomment to test (may actually hit Vercel rate limits!)
  // await simulateRapidFireRequests();

  console.log('\n═'.repeat(60));
  console.log('  Testing Complete!');
  console.log('═'.repeat(60));
  console.log('\nTo test the simulated endpoint:');
  console.log(`  curl ${BASE_URL}/api/vercel-webhook/test-rate-limit`);
  console.log('\nExpected response (429):');
  console.log(JSON.stringify({
    success: false,
    error: {
      code: 'rate_limited',
      name: 'RATE_LIMITED',
      message: 'Test simulation: Rate limit exceeded',
      status: 429
    }
  }, null, 2));
}

main().catch(console.error);
