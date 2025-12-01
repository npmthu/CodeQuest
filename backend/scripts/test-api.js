#!/usr/bin/env node

/**
 * Quick test script to demo database connectivity
 * Run: node scripts/test-api.js
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

console.log('\n🧪 Testing Database Connection & API Endpoints\n');
console.log('=' .repeat(60));

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n📍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data:`, JSON.stringify(data, null, 2).substring(0, 500));
      return data;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   Error:`, data.error);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
    return null;
  }
}

async function runTests() {
  // Test 1: List users
  await testEndpoint(
    'List Users',
    `${API_BASE}/users`
  );

  // Test 2: Leaderboard
  await testEndpoint(
    'Leaderboard (Top 10)',
    `${API_BASE}/users/leaderboard?limit=10`
  );

  // Test 3: Get specific user
  const users = await testEndpoint(
    'Get First User',
    `${API_BASE}/users`
  );

  if (users?.data?.length > 0) {
    const userId = users.data[0].id;
    
    // Test 4: Get user details
    await testEndpoint(
      'User Details',
      `${API_BASE}/users/${userId}`
    );
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Demo Complete!');
  console.log('\n📝 Available Endpoints:');
  console.log('   GET  /api/users - List all users');
  console.log('   GET  /api/users/leaderboard - Global leaderboard');
  console.log('   GET  /api/users/:id - Get user by ID');
  console.log('   GET  /api/users/me/stats - Current user stats (requires auth)');
  console.log('   GET  /api/users/me/learning-profile - Learning profile (requires auth)');
  console.log('\n');
}

runTests();
