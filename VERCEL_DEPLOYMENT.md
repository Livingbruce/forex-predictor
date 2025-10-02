# Vercel Deployment Guide

## Prerequisites

1. GitHub repository created and code pushed
2. Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `forex-prediction`
4. Click "Import"

## Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./` (root)
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm run install:all`

## Step 3: Environment Variables

Add these environment variables in Vercel dashboard:

### Required Variables:
```
NODE_ENV=production
VITE_API_URL=https://your-backend-url.vercel.app
```

### Optional (if using external services):
```
VITE_FOREX_API_KEY=your-api-key
VITE_NEWS_API_KEY=your-news-api-key
```

## Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at: `https://your-project-name.vercel.app`

## Step 5: Backend Deployment (Optional)

For full-stack deployment, you can also deploy the backend:

1. Create a separate Vercel project for the backend
2. Set the root directory to `backend/`
3. Add database environment variables
4. Deploy the backend API

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

## Monitoring

- Check deployment logs in Vercel dashboard
- Monitor performance metrics
- Set up error tracking if needed

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check build logs for missing dependencies
2. **API Errors**: Verify environment variables are set
3. **CORS Issues**: Update CORS settings in backend
4. **Database Connection**: Ensure database is accessible from Vercel

### Useful Commands:

```bash
# Test build locally
npm run build:frontend

# Preview production build
npm run preview

# Check Vercel CLI (optional)
npx vercel --version
```
