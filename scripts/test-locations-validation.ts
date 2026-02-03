import { sanitizeInput, validateQuery, MAX_QUERY_LENGTH } from '../app/api/locations/validation';
import assert from 'assert';

console.log('Testing locations validation logic...');

// Test 1: Sanitize Input
try {
  const input = 'Hello\nWorld\r\nTest';
  // [\n\r]+ matches the newline, and the CRLF sequence as a single block each (or merged if adjacent? No, text separated)
  // Hello \n World -> matches \n -> "Hello World"
  // World \r\n Test -> matches \r\n -> "World Test"
  const expected = 'Hello World Test';
  const result = sanitizeInput(input);
  assert.strictEqual(result, expected, 'Sanitize input failed to replace newlines');
  console.log('✅ Sanitize input test passed');
} catch (e) {
  console.error('❌ Sanitize input test failed', e);
  process.exit(1);
}

// Test 2: Sanitize Input with trim
try {
    const input = '\n  test  \n';
    const expected = 'test';
    const result = sanitizeInput(input);
    assert.strictEqual(result, expected, 'Sanitize input failed to trim');
    console.log('✅ Sanitize trim test passed');
} catch (e) {
    console.error('❌ Sanitize trim test failed', e);
    process.exit(1);
}


// Test 3: Validate Query - Valid
try {
  const input = 'Valid query';
  const result = validateQuery(input);
  assert.strictEqual(result.isValid, true, 'Valid query should be valid');
  console.log('✅ Valid query test passed');
} catch (e) {
    console.error('❌ Valid query test failed', e);
    process.exit(1);
}

// Test 4: Validate Query - Too Long
try {
  const input = 'a'.repeat(MAX_QUERY_LENGTH + 1);
  const result = validateQuery(input);
  assert.strictEqual(result.isValid, false, 'Too long query should be invalid');
  assert.ok(result.error?.includes('must be less than'), 'Error message mismatch');
  console.log('✅ Too long query test passed');
} catch (e) {
    console.error('❌ Too long query test failed', e);
    process.exit(1);
}

// Test 5: Validate Query - Boundary
try {
    const input = 'a'.repeat(MAX_QUERY_LENGTH);
    const result = validateQuery(input);
    assert.strictEqual(result.isValid, true, 'Boundary length query should be valid');
    console.log('✅ Boundary query test passed');
} catch (e) {
    console.error('❌ Boundary query test failed', e);
    process.exit(1);
}

console.log('All validation tests passed! 🛡️');
