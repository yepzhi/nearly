#!/bin/bash

# CloseBook — Secret Setup Script
# Usage: 
#   FIREBASE_API_KEY=xxx ... sh scripts/setup.sh
#   Or use a .env file locally

TARGET="app.js"

if [ -f .env ]; then
  echo "Loading .env file..."
  export $(grep -v '^#' .env | xargs)
fi

echo "Injecting secrets into $TARGET..."

# Replace placeholders
sed -i '' "s/FIREBASE_API_KEY/$FIREBASE_API_KEY/g" $TARGET
sed -i '' "s/FIREBASE_AUTH_DOMAIN/$FIREBASE_AUTH_DOMAIN/g" $TARGET
sed -i '' "s/FIREBASE_PROJECT_ID/$FIREBASE_PROJECT_ID/g" $TARGET
sed -i '' "s/FIREBASE_STORAGE_BUCKET/$FIREBASE_STORAGE_BUCKET/g" $TARGET
sed -i '' "s/FIREBASE_MESSAGING_SENDER_ID/$FIREBASE_MESSAGING_SENDER_ID/g" $TARGET
sed -i '' "s/FIREBASE_APP_ID/$FIREBASE_APP_ID/g" $TARGET

echo "✅ Setup complete. $TARGET is ready."
