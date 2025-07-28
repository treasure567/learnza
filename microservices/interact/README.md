
# Interact Microservice

This microservice is responsible for handling user interactions within the Learnza platform.

## Getting Started

To get started with the `interact` microservice, you'll need to have [Bun](https://bun.sh/) installed.

### Installation

1.  Navigate to the `microservices/interact` directory.
2.  Install the dependencies:

    ```bash
    bun install
    ```

### Running the Service

You can run the service in development mode, which will watch for file changes and automatically restart the server:

```bash
bun run dev
```

To run the service in production mode, use:

```bash
bun run start
```

The service will be available at `http://localhost:4001`.

## API Endpoints

### Handle Interaction

-   **Endpoint:** `POST /api/interact`
-   **Description:** Processes a user interaction.
-   **Authentication:** Requires a valid Bearer token.
-   **Request Body:**

    ```json
    {
      "userId": "string",
      "userChat": "string",
      "contentId": "string"
    }
    ```

-   **Response:**

    ```json
    {
      "success": "boolean",
      "message": "string",
      "data": "any"
    }
    ``` 