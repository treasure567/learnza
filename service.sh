#!/bin/bash
set -e

read -p "Enter the service name (without ms_ prefix): " SERVICE_NAME

SERVICE_NAME=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]')
BRANCH_NAME="ms_$SERVICE_NAME"
FOLDER_NAME="ms_$SERVICE_NAME"
REPO_URL="https://github.com/treasure567/learnza.git"

echo "Creating new microservice: $FOLDER_NAME"
echo "----------------------------------------"

git clone -b blank "$REPO_URL" temp_repo
cd temp_repo
git checkout -b "$BRANCH_NAME"

mkdir -p "controllers" "middleware" "routes" "services" "types"

touch "tsconfig.json"
touch "server.ts"
touch ".env"
touch ".gitignore"
touch "README.md"
touch "controllers/${SERVICE_NAME}Controller.ts"
touch "routes/${SERVICE_NAME}Routes.ts"
touch "middleware/authMiddleware.ts"
touch "types/${SERVICE_NAME}.ts"

npm init -y
npm install

git add .
git commit -m "Initial ${SERVICE_NAME} microservice setup"

echo "Pushing new branch to remote repository..."
git push -u origin "$BRANCH_NAME"

cd ..
mv temp_repo "$FOLDER_NAME"

echo "----------------------------------------"
echo "Microservice $FOLDER_NAME has been created successfully!"
echo "Branch $BRANCH_NAME has been pushed to remote repository"
echo "----------------------------------------"
