const readline = require('readline');
const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function sendSms(phoneNumber, message) {
  const username = process.env.SMS_GATE_USERNAME;
  const password = process.env.SMS_GATE_PASSWORD;
  const api_url = "https://sms.trenalyze.com/api/3rdparty/v1/messages";

  if (!username || !password) {
    throw new Error("SMS_GATE_USERNAME and SMS_GATE_PASSWORD must be set in environment variables");
  }

  const response = await fetch(api_url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      textMessage: { text: message },
      phoneNumbers: phoneNumber
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to send SMS: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

async function testSms() {
  try {
    console.log('=== SMS Test Script ===\n');
    
    // Check if environment variables are set
    if (!process.env.SMS_GATE_USERNAME || !process.env.SMS_GATE_PASSWORD) {
      console.error('❌ Error: SMS_GATE_USERNAME and SMS_GATE_PASSWORD must be set in environment variables');
      console.log('\nPlease add these to your .env file:');
      console.log('SMS_GATE_USERNAME=your_username');
      console.log('SMS_GATE_PASSWORD=your_password');
      return;
    }

    // Get phone number
    const phoneNumber = await new Promise((resolve) => {
      rl.question('Enter phone number (with country code, e.g., +1234567890): ', (answer) => {
        resolve([answer.trim()]);
      });
    });

    if (phoneNumber.length <= 0) {
      console.error('❌ Phone number is required');
      rl.close();
      return;
    }

    // Get message
    const message = await new Promise((resolve) => {
      rl.question('Enter message to send: ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (!message) {
      console.error('❌ Message is required');
      rl.close();
      return;
    }

    console.log('\n📱 Sending SMS...');
    console.log(`📞 To: ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    console.log('⏳ Please wait...\n');

    // Send SMS
    const result = await sendSms(phoneNumber, message);
    
    console.log('✅ SMS sent successfully!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    rl.close();
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n👋 Test cancelled');
  rl.close();
  process.exit(0);
});

// Run the test
testSms(); 



