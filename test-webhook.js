const readline = require('readline');
const fetch = require('node-fetch');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function registerWebhook(url, event = 'sms:received') {
  const username = process.env.SMS_GATE_USERNAME;
  const password = process.env.SMS_GATE_PASSWORD;
  const api_url = 'https://sms.trenalyze.com/api/3rdparty/v1/webhooks';

  if (!username || !password) {
    throw new Error('SMS_GATE_USERNAME and SMS_GATE_PASSWORD must be set in environment variables');
  }

  const body = {
    id: `webhook-${Date.now()}`,
    url,
    event
  };

  const response = await fetch(api_url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to register webhook: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

async function testWebhook() {
  try {
    console.log('=== SMS Webhook Registration Test ===\n');

    if (!process.env.SMS_GATE_USERNAME || !process.env.SMS_GATE_PASSWORD) {
      console.error('❌ Error: SMS_GATE_USERNAME and SMS_GATE_PASSWORD must be set in environment variables');
      return;
    }

    // Hardcoded webhook URL and event type
    const url = 'https://notification.learnza.net.ng/api/notifications/webhook';
    const event = 'sms:received';

    console.log(`\n🔗 Registering webhook for event "${event}" at URL: ${url}`);
    console.log('⏳ Please wait...\n');

    const result = await registerWebhook(url, event);
    console.log('✅ Webhook registered successfully!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error registering webhook:', error.message);
    console.error('🔍 Full error:', error);
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Test cancelled');
  process.exit(0);
});

testWebhook();