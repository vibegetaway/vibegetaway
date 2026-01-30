
async function verifySecurity() {
  const baseUrl = 'http://localhost:3000';
  console.log('🛡️ Sentinel Security Verification Script');
  console.log('Target:', baseUrl);

  let success = true;

  // 1. Verify Locations API
  try {
    console.log('\nTesting /api/locations...');
    const longQuery = 'a'.repeat(501);
    const res = await fetch(`${baseUrl}/api/locations?q=${longQuery}`);
    if (res.status === 400) {
      console.log('✅ Locations API correctly rejected long query.');
    } else {
      console.error(`❌ Locations API failed validation. Status: ${res.status}`);
      success = false;
    }
  } catch (e) {
    console.error('⚠️ Could not connect to Locations API (Server might be down)');
    success = false;
  }

  // 2. Verify Suggestions API
  try {
    console.log('\nTesting /api/suggestions...');
    const longInput = 'a'.repeat(101);
    const res = await fetch(`${baseUrl}/api/suggestions`, {
      method: 'POST',
      body: JSON.stringify({ input: longInput }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 400) {
      console.log('✅ Suggestions API correctly rejected long input.');
    } else {
      console.error(`❌ Suggestions API failed validation. Status: ${res.status}`);
      success = false;
    }

    // Test Invalid Type
    const resType = await fetch(`${baseUrl}/api/suggestions`, {
      method: 'POST',
      body: JSON.stringify({ input: 'test', type: 'invalid_type' }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (resType.status === 400) {
      console.log('✅ Suggestions API correctly rejected invalid type.');
    } else {
      console.error(`❌ Suggestions API failed type validation. Status: ${resType.status}`);
      success = false;
    }

  } catch (e) {
    console.error('⚠️ Could not connect to Suggestions API');
    success = false;
  }

  // 3. Verify Cached Images API
  try {
    console.log('\nTesting /api/images/cached-images...');
    const longKeywords = 'a'.repeat(501);
    const res = await fetch(`${baseUrl}/api/images/cached-images?keywords=${longKeywords}`);
    if (res.status === 400) {
      console.log('✅ Cached Images API correctly rejected long keywords.');
    } else {
      console.error(`❌ Cached Images API failed validation. Status: ${res.status}`);
      success = false;
    }
  } catch (e) {
    console.error('⚠️ Could not connect to Cached Images API');
    success = false;
  }

  if (!success) {
      console.error('\n❌ Verification Failed');
      process.exit(1);
  } else {
      console.log('\n✅ Verification Passed');
  }
}

verifySecurity();
