import { validateInspirationRequest, MAX_INPUT_LENGTH, MAX_EXCLUSIONS_COUNT } from '../app/api/inspiration-cards/validation';

const run = () => {
  console.log('Verifying inspiration request validation logic...');

  // Test 1: Valid request
  const validResult = validateInspirationRequest({ activity: 'surf', location: 'Bali' });
  if (validResult !== null) {
    console.error('❌ Valid request failed validation:', validResult);
    process.exit(1);
  }
  console.log('✅ Valid request passed');

  // Test 2: Valid request with exclusions
  const validWithExclusions = validateInspirationRequest({
    activity: 'surf',
    location: 'Bali',
    excludeActivities: ['hiking']
  });
  if (validWithExclusions !== null) {
    console.error('❌ Valid request with exclusions failed:', validWithExclusions);
    process.exit(1);
  }
  console.log('✅ Valid request with exclusions passed');

  // Test 3: Huge activity
  const hugeString = 'a'.repeat(MAX_INPUT_LENGTH + 1);
  const invalidActivity = validateInspirationRequest({ activity: hugeString, location: 'Bali' });
  if (!invalidActivity || !invalidActivity.includes('Activity too long')) {
    console.error('❌ Huge activity check failed. Result:', invalidActivity);
    process.exit(1);
  }
  console.log('✅ Huge activity rejected');

  // Test 4: Huge location
  const invalidLocation = validateInspirationRequest({ activity: 'surf', location: hugeString });
  if (!invalidLocation || !invalidLocation.includes('Location too long')) {
    console.error('❌ Huge location check failed. Result:', invalidLocation);
    process.exit(1);
  }
  console.log('✅ Huge location rejected');

  // Test 5: Too many exclusions
  const manyExclusions = Array(MAX_EXCLUSIONS_COUNT + 1).fill('foo');
  const invalidExclusionCount = validateInspirationRequest({ activity: 'surf', location: 'Bali', excludeActivities: manyExclusions });
  if (!invalidExclusionCount || !invalidExclusionCount.includes('Too many exclusions')) {
    console.error('❌ Exclusion count check failed. Result:', invalidExclusionCount);
    process.exit(1);
  }
  console.log('✅ Exclusion count rejected');

  // Test 6: Huge exclusion item
  const invalidExclusionItem = validateInspirationRequest({
    activity: 'surf',
    location: 'Bali',
    excludeActivities: [hugeString]
  });
  if (!invalidExclusionItem || !invalidExclusionItem.includes('Exclusion item too long')) {
    console.error('❌ Exclusion item length check failed. Result:', invalidExclusionItem);
    process.exit(1);
  }
  console.log('✅ Exclusion item length rejected');

  // Test 7: Invalid exclusion type
  const invalidExclusionType = validateInspirationRequest({
    activity: 'surf',
    location: 'Bali',
    excludeActivities: [123]
  });
  if (!invalidExclusionType || !invalidExclusionType.includes('Exclusions must be strings')) {
    console.error('❌ Exclusion type check failed. Result:', invalidExclusionType);
    process.exit(1);
  }
  console.log('✅ Exclusion type rejected');

  console.log('🎉 All validation tests passed!');
};

run();
