#!/usr/bin/env node

const https = require('https');

const API_BASE_URL = 'https://my-friend-teacher-api.vercel.app';
const API_SECRET_KEY = 'mft-2024-secure-api-key-v1-random-string-12345';

async function testDeployment() {
  console.log('🧪 Testing Vercel deployment...\n');

  try {
    // Test health endpoint
    await testHealthEndpoint();
    
    // Test chat endpoint
    await testChatEndpoint();
    
    console.log('\n✅ All deployment tests passed!');
  } catch (error) {
    console.error('\n💥 Deployment test failed:', error.message);
    process.exit(1);
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testHealthEndpoint() {
  console.log('📡 Testing health endpoint...');
  
  const response = await makeRequest(`${API_BASE_URL}/health`);
  
  if (response.status !== 200) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  
  if (response.data.status !== 'ok') {
    throw new Error('Health check returned invalid status');
  }
  
  console.log('✅ Health endpoint working');
  console.log(`   Status: ${response.data.status}`);
  console.log(`   Service: ${response.data.service}`);
}

async function testChatEndpoint() {
  console.log('📡 Testing chat endpoint...');
  
  const testUserId = 'test-user-12345678-1234-4321-abcd-123456789012';
  
  const requestBody = JSON.stringify({
    messages: [
      {
        id: '1',
        content: 'Hello! Please respond with just "API test successful".',
        isUser: true,
        timestamp: new Date().toISOString()
      }
    ],
    language: 'english',
    personality: {
      humor: 3,
      mockery: 2,
      seriousness: 3,
      professionalism: 4
    },
    userId: testUserId
  });

  const response = await makeRequest(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_SECRET_KEY,
      'x-user-id': testUserId,
    },
    body: requestBody
  });

  if (response.status !== 200) {
    console.error('❌ Chat response:', response.status);
    console.error('❌ Error details:', response.data);
    throw new Error(`Chat endpoint failed: ${response.status}`);
  }

  console.log('✅ Chat endpoint working');
  console.log(`   AI Response: ${response.data.message}`);
  console.log(`   User ID: ${response.data.userId}`);
  console.log(`   Timestamp: ${response.data.timestamp}`);
}

testDeployment();