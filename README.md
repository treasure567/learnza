
# Notifications Microservice

This microservice is responsible for sending push notifications and emails for the Learnza platform.

## Getting Started

To get started with the `notifications` microservice, you'll need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Installation

1.  Navigate to the `microservices/notifications` directory.
2.  Install the dependencies:

    ```bash
    npm install
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

### Send Push Notification

-   **Endpoint:** `POST /api/notifications/push`
-   **Description:** Sends a push notification to a specific device.
-   **Authentication:** Requires a valid Bearer token.
-   **Request Body:**

    ```json
    {
      "token": "string",
      "title": "string",
      "body": "string"
    }
    ```

### Send Email Notification

-   **Endpoint:** `POST /api/notifications/email`
-   **Description:** Sends an email notification.
-   **Authentication:** Requires a valid Bearer token.
-   **Request Body:**

    ```json
    {
      "to": "string",
      "subject": "string",
      "html": "string"
    }
    ``` 