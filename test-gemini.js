const { config } = require('dotenv');
config();

async function testGemini() {
  console.log('🧪 Testing Gemini Service...');
  
  try {
    // Import the compiled service
    const { default: geminiService } = await import('./dist/services/GeminiService.js');
    
    console.log('✅ Gemini service imported successfully');
    
    // Test health check
    console.log('\n🔍 Testing health check...');
    const health = await geminiService.healthCheck();
    console.log('Health status:', JSON.stringify(health, null, 2));
    
    // Test SMS reply generation
    console.log('\n💬 Testing SMS reply generation...');
    const testMessage = "Hi, what courses do you offer?";
    const testPhone = "+1234567890";
    
    const reply = await geminiService.craftSmsReply(testMessage, testPhone);
    console.log(`Test message: "${testMessage}"`);
    console.log(`Generated reply: "${reply}"`);
    console.log(`Reply length: ${reply.length} characters`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testGemini();