
import { validateSearchQuery, MAX_QUERY_LENGTH } from '../app/api/locations/validation';

console.log('Running validation tests...');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

try {
  // Test 1: Valid query
  const valid = validateSearchQuery('Tokyo');
  assert(valid === 'Tokyo', 'Valid query should be returned as is');

  // Test 2: Empty query (null)
  const emptyNull = validateSearchQuery(null);
  assert(emptyNull === '', 'Null query should return empty string');

  // Test 3: Empty query (empty string)
  const emptyStr = validateSearchQuery('');
  assert(emptyStr === '', 'Empty string query should return empty string');

  // Test 4: Sanitization (newlines)
  const unsanitized = 'Tokyo\nJapan';
  const sanitized = validateSearchQuery(unsanitized);
  assert(sanitized === 'Tokyo Japan', 'Newlines should be replaced with space');

  // Test 5: Sanitization (trim)
  const untrimmed = '  Paris  ';
  const trimmed = validateSearchQuery(untrimmed);
  assert(trimmed === 'Paris', 'Whitespace should be trimmed');

  // Test 6: Too long query
  const longQuery = 'a'.repeat(MAX_QUERY_LENGTH + 1);
  try {
    validateSearchQuery(longQuery);
    assert(false, 'Should throw error for long query');
  } catch (e: any) {
    assert(e.message.includes('Query too long'), 'Error message should indicate length issue');
  }

  // Test 7: Max length query (boundary)
  const maxQuery = 'a'.repeat(MAX_QUERY_LENGTH);
  const validMax = validateSearchQuery(maxQuery);
  assert(validMax === maxQuery, 'Max length query should be valid');

} catch (err) {
  console.error('Unexpected error during tests:', err);
  failed++;
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
