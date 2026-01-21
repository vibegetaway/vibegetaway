
import { GET } from '../app/api/images/pixabay-images/route';
import { NextRequest } from 'next/server';

// Mock NextRequest since we are running outside of Next.js server
// We need to polyfill/mock what GET expects.
// GET expects a NextRequest which extends Request.

// A simple mock for verification
class MockNextRequest extends Request {
    nextUrl: URL;

    constructor(url: string) {
        super(url);
        this.nextUrl = new URL(url);
    }
}

async function runTests() {
    console.log('Running Pixabay API Validation Tests...');
    let passed = 0;
    let failed = 0;

    async function test(name: string, url: string, expectedStatus: number, expectedError?: string) {
        try {
            const req = new MockNextRequest(url) as unknown as NextRequest;
            const res = await GET(req);

            if (res.status !== expectedStatus) {
                console.error(`❌ ${name}: Expected status ${expectedStatus}, got ${res.status}`);
                if (res.status !== 200) {
                     const data = await res.json();
                     console.error(`   Response error: ${data.error}`);
                }
                failed++;
                return;
            }

            if (expectedError) {
                const data = await res.json();
                if (!data.error || !data.error.includes(expectedError)) {
                    console.error(`❌ ${name}: Expected error containing "${expectedError}", got "${data.error}"`);
                    failed++;
                    return;
                }
            }

            console.log(`✅ ${name}`);
            passed++;
        } catch (e) {
            console.error(`❌ ${name}: Exception thrown`, e);
            failed++;
        }
    }

    // 1. Test missing keywords
    await test('Missing keywords', 'http://localhost/api/images?limit=10', 400, 'Keywords parameter is required');

    console.log('\n--- Post-fix checks (expecting Validation) ---');

    // 2. Test extremely long keywords (Should now return 400)
    const longKeyword = 'a'.repeat(600);
    await test('Long keyword string', `http://localhost/api/images?keywords=${longKeyword}`, 400, 'Keywords parameter too long');

    // 3. Test too many keywords (Should now return 400)
    const manyKeywords = Array(20).fill('test').join(',');
    await test('Too many keywords', `http://localhost/api/images?keywords=${manyKeywords}`, 400, 'Too many keywords');

    // 4. Test individual keyword too long
    const longIndividualKeyword = 'a'.repeat(150);
    await test('Individual keyword too long', `http://localhost/api/images?keywords=test,${longIndividualKeyword}`, 400, 'is too long');

    console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
}

runTests().catch(console.error);
