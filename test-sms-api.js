const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const BASE_URL = 'http://localhost:4002/api/sms';

async function testSmsController() {
  console.log('=== SMS Controller Test ===\n');

  try {
    // Test health check endpoint
    console.log('1. Testing health check endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/sms/health`);
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    console.log('');

    // Test SMS sending endpoint (without auth for testing)
    console.log('2. Testing SMS sending endpoint...');
    const smsData = {
      phoneNumber: '+1234567890', // Replace with actual test number
      message: 'Test message from SMS controller'
    };

    const smsResponse = await fetch(`${BASE_URL}/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you'd need proper auth token
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(smsData)
    });

    const smsResult = await smsResponse.json();
    console.log('SMS response:', smsResult);
    console.log('');

    // Test validation - missing fields
    console.log('3. Testing validation - missing fields...');
    const invalidResponse = await fetch(`${BASE_URL}/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ phoneNumber: '+1234567890' }) // Missing message
    });

    const invalidResult = await invalidResponse.json();
    console.log('Validation response:', invalidResult);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSmsController(); 