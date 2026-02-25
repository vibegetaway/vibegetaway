import { validateSearchQuery, MAX_QUERY_LENGTH } from '@/app/api/locations/validation';

console.log('Running validation tests...');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

function assertThrows(fn: () => any, message: string) {
  try {
    fn();
    console.error(`FAIL: ${message} (did not throw)`);
    failed++;
  } catch (e) {
    console.log(`PASS: ${message} (threw as expected)`);
    passed++;
  }
}

// Test 1: Valid Query
const validQuery = 'Tokyo, Japan';
const result1 = validateSearchQuery(validQuery);
assert(result1 === validQuery, `Valid query "${validQuery}" should be returned as is`);

// Test 2: Empty Query
const emptyQuery = '';
const result2 = validateSearchQuery(emptyQuery);
assert(result2 === '', `Empty query should return empty string`);

// Test 3: Null Query
const result3 = validateSearchQuery(null);
assert(result3 === '', `Null query should return empty string`);

// Test 4: Long Query
const longQuery = 'a'.repeat(MAX_QUERY_LENGTH + 1);
assertThrows(() => validateSearchQuery(longQuery), `Query longer than ${MAX_QUERY_LENGTH} chars should throw`);

// Test 5: Boundary Query
const boundaryQuery = 'a'.repeat(MAX_QUERY_LENGTH);
const result5 = validateSearchQuery(boundaryQuery);
assert(result5 === boundaryQuery, `Query with exactly ${MAX_QUERY_LENGTH} chars should be allowed`);

// Test 6: Sanitization (newlines)
const queryWithNewlines = 'Tokyo\nJapan\r\n2024';
const result6 = validateSearchQuery(queryWithNewlines);
// \n -> space, \r -> space, \n -> space. So "Tokyo Japan  2024"
assert(result6 === 'Tokyo Japan  2024', `Newlines should be replaced with spaces. Got "${result6}"`);

// Test 7: Sanitization (trimming)
const queryWithSpaces = '   Bali   ';
const result7 = validateSearchQuery(queryWithSpaces);
assert(result7 === 'Bali', `Query should be trimmed. Got "${result7}"`);

// Summary
console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
