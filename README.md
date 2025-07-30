# AI Microservice - Learnza

This microservice provides AI-powered lesson content generation for the Learnza platform.

## Authentication

All endpoints require authentication using a Bearer token. The token should be included in the Authorization header.

### Example Request

```bash
curl -X POST http://localhost:3001/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userRequest": "Create a lesson about JavaScript basics",
    "lessonId": "lesson_id_here"
  }'
```

## Environment Variables

Make sure to set the following environment variables:

- `JWT_SECRET`: Secret key for JWT token verification (must match the main backend)
- `MONGODB_URI`: MongoDB connection string
- `AI_SERVICE_PORT`: Port for the microservice (default: 3001)
- `GEMINI_API_KEY`: Google Gemini API key for AI content generation

## Endpoints

### POST /generate

Generates lesson content based on user request.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Body:**
```json
{
  "userRequest": "string",
  "lessonId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lesson content generated successfully",
  "data": [...]
}
```

## Running the Service

```bash
npm install
npm run dev
```

The service will start on port 3001 (or the port specified in AI_SERVICE_PORT). 