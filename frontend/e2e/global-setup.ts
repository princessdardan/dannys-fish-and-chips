/**
 * Playwright Global Setup
 *
 * Ensures Next.js has finished initial compilation before tests run.
 * This prevents tests from running during "Compiling..." state.
 */

async function globalSetup() {
  console.log('⏳ Waiting for Next.js to finish initial compilation...');

  const maxAttempts = 60; // 60 attempts
  const delayMs = 1000; // 1 second between attempts = 60 seconds max wait

  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Try to fetch the homepage
      const response = await fetch('http://localhost:3000');

      if (response.ok) {
        const html = await response.text();

        // Check if page is still compiling
        if (!html.includes('Compiling') && html.includes('</html>')) {
          console.log('✅ Next.js compilation complete! Starting tests...');
          return;
        }
      }
    } catch {
      // Server not ready yet, continue waiting
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Next.js did not finish compiling within 60 seconds');
}

export default globalSetup;
