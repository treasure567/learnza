# SMS Microservice Test Guide

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the `ms_sms` directory with the following variables:
   ```
   SMS_GATE_USERNAME=your_sms_gate_username
   SMS_GATE_PASSWORD=your_sms_gate_password
   JWT_SECRET=your_jwt_secret_here
   PORT=3004
   NODE_ENV=development
   ```

   Replace `your_sms_gate_username` and `your_sms_gate_password` with your actual SMS gateway credentials.

## Testing SMS Functionality

### Option 1: Using the Test Script

Run the interactive test script:
```bash
node test-sms.js
```

The script will:
1. Ask for your phone number (with country code)
2. Ask for the message you want to send
3. Send the SMS and show the result

### Option 2: Using the API Endpoint

Start the microservice:
```bash
npm start
```

Then send a POST request to `/sms`:
```bash
curl -X POST http://localhost:3004/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Hello from Learnza!"
  }'
```

## Example Usage

### Test Script Example:
```bash
$ node test-sms.js
=== SMS Test Script ===

Enter phone number (with country code, e.g., +1234567890): +1234567890
Enter message to send: Hello from Learnza!

📱 Sending SMS...
📞 To: +1234567890
💬 Message: Hello from Learnza!
⏳ Please wait...

✅ SMS sent successfully!
📊 Response: {
  "status": "success",
  "messageId": "12345"
}
```

## Troubleshooting

1. **Environment Variables Not Set**
   - Make sure you have created a `.env` file
   - Verify your SMS gateway credentials are correct

2. **Network Errors**
   - Check your internet connection
   - Verify the SMS gateway API is accessible

3. **Authentication Errors**
   - Double-check your username and password
   - Ensure your SMS gateway account is active

## API Endpoints

- `POST /sms` - Send SMS message
- `POST /push` - Send push notification
- `POST /email` - Send email notification

All endpoints require authentication via JWT token. 