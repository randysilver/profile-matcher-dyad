# Deployment Guide for Vercel

## Step 1: Push to GitHub

1. Commit all changes:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click "Deploy"

## Step 3: Verify Deployment

1. Once deployed, Vercel will provide a URL like `https://your-app.vercel.app`
2. Visit the URL to test the application
3. The LinkedIn Profile Matcher should load without errors

## Troubleshooting

If you encounter build errors:

1. **Lockfile issues**: Delete `pnpm-lock.yaml` if it exists
2. **Dependency conflicts**: Run `npm install` locally to generate fresh `package-lock.json`
3. **Build failures**: Check the build logs in Vercel dashboard for specific errors

## Environment Variables

No environment variables are needed for the demo version. In production, you would need to set up:
- LinkedIn API credentials
- Database connection strings
- Other service credentials

The application is now ready for deployment!