
# SMS Microservice

This microservice is responsible for sending SMS notifications for the Learnza platform using the Trenalyze SMS gateway.

## Getting Started

To get started with the `sms` microservice, you'll need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Installation

1. Navigate to the `ms_sms` directory.
2. Install the dependencies:

    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SMS_GATE_USERNAME=your_username
SMS_GATE_PASSWORD=your_password
SMS_SERVICE_PORT=4002
MONGODB_URI=mongodb://localhost:27017/learnza (optional)
```

### Running the Service

You can run the service in development mode, which will watch for file changes and automatically restart the server:

```bash
npm run dev
```

To run the service in production mode, use:

```bash
npm run start
```

The service will be available at `http://localhost:4002`.

## API Endpoints

### Send SMS

- **Endpoint:** `POST /api/sms/sms`
- **Description:** Sends an SMS to a specified phone number.
- **Authentication:** Requires a valid Bearer token.
- **Request Body:**

    ```json
    {
      "phoneNumber": "+1234567890",
      "message": "Your verification code is 123456"
    }
    ```

- **Response:**

    ```json
    {
      "success": true,
      "message": "SMS sent successfully",
      "data": {
        // SMS gateway response data
      }
    }
    ```

### SMS Health Check

- **Endpoint:** `GET /api/sms/sms/health`
- **Description:** Checks if the SMS service is properly configured and healthy.
- **Authentication:** None required.
- **Response:**

    ```json
    {
      "success": true,
      "message": "SMS service is healthy and ready",
      "configured": true
    }
    ```

## Testing

### Manual Testing

Use the provided test scripts:

```bash
# Test SMS functionality directly (bypasses API)
node test-sms-direct.js

# Test the SMS API endpoints
node test-sms-api.js
```

### API Testing

You can test the endpoints using curl or any API client:

```bash
# Health check
curl http://localhost:4002/api/sms/sms/health

# Send SMS (requires auth token)
curl -X POST http://localhost:4002/api/sms/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Test message"
  }'
```

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request:** Missing required fields or invalid phone number format
- **401 Unauthorized:** Invalid or missing authentication token
- **500 Internal Server Error:** SMS gateway errors or service issues
- **503 Service Unavailable:** SMS credentials not configured

## SMS Gateway

This service uses the Trenalyze SMS gateway API. Make sure you have valid credentials configured in your environment variables.

## Project Structure

```
ms_sms/
├── controllers/
│   └── SmsController.ts          # SMS controller with endpoints
├── routes/
│   └── smsRoutes.ts              # SMS route definitions
├── services/
│   └── SmsService.ts             # SMS gateway integration
├── types/
│   └── sms.ts                    # SMS type definitions
├── middleware/
│   └── authMiddleware.ts          # Authentication middleware
├── test-sms-direct.js            # Direct SMS testing script
├── test-sms-api.js               # API endpoint testing script
├── server.ts                     # Main server file
└── README.md                     # This documentation
``` 