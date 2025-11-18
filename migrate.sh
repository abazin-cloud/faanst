#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run drizzle-kit commands
echo "Generating migration..."
npx drizzle-kit generate

echo ""
echo "Applying migration..."
npx drizzle-kit push

echo ""
echo "Migration complete!"






