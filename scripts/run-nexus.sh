#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Nexus System...${NC}"

# Load environment variables from .env file
if [ -f .env ]; then
    echo -e "${GREEN}Loading environment variables from .env file...${NC}"
    set -a
    source .env
    set +a
else
    echo -e "${YELLOW}Warning: .env file not found${NC}"
fi

# Check if environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}Warning: OPENAI_API_KEY is not set${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}Warning: Supabase credentials are not set${NC}"
    exit 1
fi

# Export variables for the Node process
export SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
export SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Run the Nexus system
echo -e "${GREEN}Initializing Nexus components...${NC}"
NODE_PATH=./src npx ts-node -r tsconfig-paths/register src/nexus/tests/run-nexus.ts

# Keep the script running
trap "echo -e '${GREEN}Shutting down Nexus system...${NC}' && exit 0" SIGINT SIGTERM

# Wait for the background process
wait 