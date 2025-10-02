# Production Environment Configuration

## Environment Variables for Production

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-api.vercel.app
VITE_WS_URL=wss://your-backend-api.vercel.app
VITE_APP_NAME=Forex Prediction System
VITE_APP_VERSION=1.0.0
```

### Backend (.env.production)
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=forex_prediction_prod
DB_USER=your-db-user
DB_PASSWORD=your-db-password
API_KEY=your-forex-api-key
NEWS_API_KEY=your-news-api-key
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## Vercel Configuration

### vercel.json (Frontend)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm run install:all"
}
```

### vercel.json (Backend)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/intelligent-backend.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/backend/intelligent-backend.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Database Setup for Production

1. **Use a managed PostgreSQL service:**
   - Vercel Postgres
   - Supabase
   - PlanetScale
   - AWS RDS

2. **Connection string format:**
   ```
   postgresql://username:password@host:port/database
   ```

## Security Considerations

1. **Environment Variables:**
   - Never commit .env files
   - Use Vercel's environment variable system
   - Rotate API keys regularly

2. **CORS Configuration:**
   - Set specific origins in production
   - Avoid using wildcard (*) in production

3. **Rate Limiting:**
   - Implement API rate limiting
   - Use Vercel's built-in rate limiting

4. **HTTPS:**
   - Vercel provides HTTPS by default
   - Ensure all API calls use HTTPS

## Monitoring and Analytics

1. **Vercel Analytics:**
   - Enable in project settings
   - Monitor performance metrics

2. **Error Tracking:**
   - Consider Sentry integration
   - Monitor API errors

3. **Logging:**
   - Use Vercel's function logs
   - Implement structured logging

## Performance Optimization

1. **Frontend:**
   - Enable Vercel's Edge Network
   - Use CDN for static assets
   - Implement code splitting

2. **Backend:**
   - Use Vercel's serverless functions
   - Implement caching strategies
   - Optimize database queries

## Backup Strategy

1. **Database Backups:**
   - Enable automated backups
   - Test restore procedures

2. **Code Backups:**
   - GitHub provides version control
   - Regular commits and tags

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API endpoints working
- [ ] Frontend builds successfully
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Error handling implemented
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place
