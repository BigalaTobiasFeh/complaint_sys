#!/bin/bash

# NAHPI Complaints System - Quick Deployment Script
# This script helps prepare and deploy the application to Vercel

echo "🚀 NAHPI Complaints System - Deployment Preparation"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Step 1: Checking project structure..."
if [ -f "next.config.js" ] && [ -f "vercel.json" ] && [ -f ".env.example" ]; then
    echo "✅ All configuration files present"
else
    echo "❌ Missing configuration files"
    exit 1
fi

echo "📦 Step 2: Installing dependencies..."
npm install

echo "🔍 Step 3: Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before deploying."
    exit 1
fi

echo "🧹 Step 4: Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  ESLint warnings/errors found. Consider fixing them."
    echo "Run 'npm run lint:fix' to auto-fix some issues."
fi

echo "🏗️  Step 5: Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "🧪 Step 6: Cleaning up build artifacts..."
rm -rf .next

echo "✅ Pre-deployment checks completed successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to vercel.com and import your GitHub repository"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT-GUIDE.md"
echo ""
echo "🎉 Your NAHPI Complaints System is ready for deployment!"
