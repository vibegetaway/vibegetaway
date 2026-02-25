import { POST } from '../app/api/suggestions/route';

async function runTests() {
  console.log('Running Suggestion API Security Verification...');
  let passed = true;

  // Test 1: Valid Input
  {
    console.log('Test 1: Valid Input');
    const req = new Request('http://localhost:3000/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ input: 'test', type: 'vibe' }),
    });
    const res = await POST(req);
    // If it's 400, it failed validation (unexpected). If 500 or 200, it passed validation.
    if (res.status === 400) {
      console.error('❌ Test 1 Failed: Valid input was rejected with 400.');
      try {
          const data = await res.json();
          console.error('Response:', data);
      } catch (e) {
          console.error('Response text:', await res.text());
      }
      passed = false;
    } else {
        console.log(`✅ Test 1 Passed: Valid input proceeded (Status: ${res.status})`);
    }
  }

  // Test 2: Input Too Long
  {
    console.log('Test 2: Input Too Long');
    const longInput = 'a'.repeat(501);
    const req = new Request('http://localhost:3000/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ input: longInput, type: 'vibe' }),
    });
    const res = await POST(req);
    if (res.status === 400) {
       const data = await res.json();
       if (data.error && data.error.includes('Input exceeds')) {
           console.log('✅ Test 2 Passed: Rejected long input.');
       } else {
           console.error('❌ Test 2 Failed: Rejected but with wrong error.', data);
           passed = false;
       }
    } else {
       console.error(`❌ Test 2 Failed: Did not reject long input (Status: ${res.status})`);
       passed = false;
    }
  }

  // Test 3: Context Too Long
  {
    console.log('Test 3: Context Too Long');
    const longContext = 'a'.repeat(1001);
    const req = new Request('http://localhost:3000/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ input: 'test', context: longContext, type: 'vibe' }),
    });
    const res = await POST(req);
    if (res.status === 400) {
       const data = await res.json();
       if (data.error && data.error.includes('Context exceeds')) {
           console.log('✅ Test 3 Passed: Rejected long context.');
       } else {
           console.error('❌ Test 3 Failed: Rejected but with wrong error.', data);
           passed = false;
       }
    } else {
       console.error(`❌ Test 3 Failed: Did not reject long context (Status: ${res.status})`);
       passed = false;
    }
  }

  // Test 4: Invalid Type
  {
    console.log('Test 4: Invalid Type');
    const req = new Request('http://localhost:3000/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ input: 'test', type: 'hacking' }),
    });
    const res = await POST(req);
    if (res.status === 400) {
       const data = await res.json();
       if (data.error && data.error.includes('Invalid type')) {
           console.log('✅ Test 4 Passed: Rejected invalid type.');
       } else {
           console.error('❌ Test 4 Failed: Rejected but with wrong error.', data);
           passed = false;
       }
    } else {
       console.error(`❌ Test 4 Failed: Did not reject invalid type (Status: ${res.status})`);
       passed = false;
    }
  }

  if (!passed) {
      console.error('❌ One or more tests failed.');
      process.exit(1);
  } else {
      console.log('✅ All security tests passed.');
  }
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
