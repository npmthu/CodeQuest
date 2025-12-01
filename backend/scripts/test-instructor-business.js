import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

// Test user credentials
const TEST_EMAIL = 'student@hcmus.edu.vn';
const TEST_PASSWORD = 'Test@123456';

async function getToken() {
  try {
    // Sign in to get token
    const signInRes = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });

    const signInData = await signInRes.json();
    if (!signInData.data?.session?.access_token) {
      console.log('❌ Failed to get token:', signInData);
      process.exit(1);
    }

    return signInData.data.session.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    process.exit(1);
  }
}

async function testAPI(endpoint, token) {
  try {
    console.log(`\n🔍 Testing: GET ${endpoint}`);
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    
    if (res.ok) {
      console.log(`✅ ${res.status} OK`);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ ${res.status} Error`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function main() {
  console.log('🚀 Testing Instructor & Business APIs...\n');
  
  const token = await getToken();
  console.log('✅ Got authentication token\n');

  // Test instructor endpoints
  console.log('=== INSTRUCTOR ENDPOINTS ===');
  await testAPI('/instructor/stats', token);
  await testAPI('/instructor/courses', token);
  await testAPI('/instructor/analytics', token);
  await testAPI('/instructor/activities', token);

  // Test business endpoints
  console.log('\n=== BUSINESS ENDPOINTS ===');
  await testAPI('/business/stats', token);
  await testAPI('/business/leaderboard', token);
  await testAPI('/business/analytics', token);
  await testAPI('/business/cohorts', token);
  await testAPI('/business/activities', token);

  console.log('\n✅ All tests completed!');
}

main();
