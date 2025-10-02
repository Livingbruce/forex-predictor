@echo off
echo ========================================
echo Forex Prediction System - Deployment
echo ========================================
echo.

echo Checking Git status...
git status

echo.
echo ========================================
echo Step 1: Push to GitHub
echo ========================================
echo.
echo Please follow these steps:
echo 1. Go to https://github.com/new
echo 2. Create a new repository named "forex-prediction"
echo 3. Copy the repository URL
echo 4. Run these commands:
echo.
echo    git remote add origin YOUR_REPOSITORY_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo Press any key when you've completed the GitHub setup...
pause

echo.
echo ========================================
echo Step 2: Deploy to Vercel
echo ========================================
echo.
echo Please follow these steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Click "New Project"
echo 3. Import your GitHub repository
echo 4. Configure build settings:
echo    - Framework: Vite
echo    - Build Command: cd frontend && npm run build
echo    - Output Directory: frontend/dist
echo    - Install Command: npm run install:all
echo 5. Add environment variables:
echo    - NODE_ENV=production
echo    - VITE_API_URL=https://your-backend-url.vercel.app
echo 6. Click "Deploy"
echo.
echo Press any key when deployment is complete...
pause

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your forex prediction system is now live!
echo Check your Vercel dashboard for the deployment URL.
echo.
echo For troubleshooting, check:
echo - GITHUB_SETUP.md
echo - VERCEL_DEPLOYMENT.md
echo.
pause
