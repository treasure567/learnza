#!/bin/bash

if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it first."
    echo "You can install it using:"
    echo "  - On macOS: brew install jq"
    echo "  - On Ubuntu/Debian: sudo apt-get install jq"
    exit 1
fi

REPO_URL="https://github.com/treasure567/learnza.git"

branches=(
    "backend"
    "frontend"
    "blockchain"
    "ms_ai"
    "ms_interact"
    "ms_notification"
    "dev_naheem"
    "ms_sms"
)

ROOT_DIR="$(pwd)/"

mkdir -p "$ROOT_DIR"

setup_env_vars() {
    local branch=$1
    local env_file=$2
    local env_file_path="$ROOT_DIR/env.json"
    
    echo "Debug: Looking for env.json at: $env_file_path"
    echo "Debug: Current directory: $(pwd)"
    echo "Debug: Script directory: $(dirname "$0")"
    
    if [ ! -f "$env_file_path" ]; then
        echo "Error: env.json not found at $env_file_path"
        exit 1
    fi
    
    echo "Debug: Content of env.json:"
    cat "$env_file_path"
    
    if jq -e ".[\"$branch\"]" "$env_file_path" > /dev/null 2>&1; then
        echo "Setting up environment variables for $branch"
        
        jq -r ".[\"$branch\"] | to_entries | .[] | \"\(.key)=\(.value)\"" "$env_file_path" > "$env_file"
        
        echo "Environment variables set up successfully"
    else
        echo "Warning: No environment variables found for $branch in env.json"
    fi
}

setup_branch() {
    local branch=$1
    local branch_dir="$ROOT_DIR/$branch"

    echo "Checking if folder $branch_dir exists"
    if [ -d "$branch_dir" ]; then
        echo "Folder $branch_dir already exists"
        return
    fi
    
    echo "Setting up branch: $branch"
    
    mkdir -p "$branch_dir"
    
    cd "$branch_dir" || exit
    
    echo "Cloning repository for branch: $branch"
    git clone --branch "$branch" "$REPO_URL" .

    echo "Installing dependencies"
    npm install

    echo "Setting up environment variables"
    setup_env_vars "$branch" ".env"
    
    cd "$ROOT_DIR" || exit
    
    echo "Completed setup for branch: $branch"
    echo "----------------------------------------"
}

echo "Starting branch setup process..."
echo "----------------------------------------"

for branch in "${branches[@]}"; do
    setup_branch "$branch"
done

echo "All branches have been set up successfully!"
echo "Each branch has been configured with its specific environment variables from env.json"
