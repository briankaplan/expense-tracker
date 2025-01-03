#!/bin/bash

# Create src directory structure
mkdir -p src/components/{ui,views/{layout,auth,expenses,subscriptions}}
mkdir -p src/lib/{firebase,hooks,services,context}

# Execute TypeScript scripts
echo "Moving files..."
npm run move:files

echo "Updating imports..."
npm run update-imports

echo "Verifying structure..."
npm run verify:structure

echo "Verifying imports..."
npm run verify:imports 