
import { GET } from '../app/api/locations/route';

async function runTest() {
  console.log('--- Starting Security Verification ---');

  const longQuery = 'a'.repeat(500);
  const url = `http://localhost:3000/api/locations?q=${longQuery}`;
  const request = new Request(url);

  console.log(`Testing with query length: ${longQuery.length}`);

  try {
    const response = await GET(request);
    console.log(`Response Status: ${response.status}`);

    if (response.status === 400) {
      console.log('✅ SECURE: Request rejected with 400');
      try {
          const data = await response.json();
          console.log('Error message:', data.error);
      } catch (e) {
          console.log('Could not parse JSON body');
      }
    } else {
      console.log(`❌ VULNERABLE: Request accepted with status ${response.status} (expected 400)`);
    }
  } catch (error) {
    console.error('Test Error:', error);
  }
}

runTest();
