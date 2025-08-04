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
      rl.close();
      return;
    }

    const url = await new Promise((resolve) => {
      rl.question('Enter webhook URL: ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (!url) {
      console.error('❌ Webhook URL is required');
      rl.close();
      return;
    }

    const event = await new Promise((resolve) => {
      rl.question('Enter event type (default: sms:received): ', (answer) => {
        resolve(answer.trim() || 'sms:received');
      });
    });

    console.log(`\n🔗 Registering webhook for event "${event}" at URL: ${url}`);
    console.log('⏳ Please wait...\n');

    const result = await registerWebhook(url, event);
    console.log('✅ Webhook registered successfully!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error registering webhook:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    rl.close();
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Test cancelled');
  rl.close();
  process.exit(0);
});

testWebhook(); 