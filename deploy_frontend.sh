#!/bin/bash
echo "🚀 Deploying Warefy Frontend..."

# Navigate to frontend directory
cd frontend

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it with 'npm i -g vercel'"
    exit 1
fi

# Deploy to production
echo "📦 Building and deploying to Vercel Production..."
npx vercel --prod

echo "✅ Deployment command sent!"
