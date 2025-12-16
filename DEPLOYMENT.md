# Deployment Guide - Vercel

This guide will help you deploy the RealPaperTrading Simulator to Vercel.

## Prerequisites

- GitHub, GitLab, or Bitbucket account
- Vercel account (free tier is sufficient)
- InstantDB App ID (see INSTANTDB_SETUP.md)
- Twelve Data API Key (already provided: `6d8e110e8f884e4782c3af257e57f7df`)

## Step 1: Push Code to Git Repository

If you haven't already, initialize a Git repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit - RealPaperTrading Simulator"
```

Then create a new repository on GitHub/GitLab/Bitbucket and push:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## Step 2: Sign Up for Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" (or your Git provider)
4. Authorize Vercel to access your repositories

## Step 3: Import Your Project

1. Click "Add New..." → "Project"
2. Find your repository in the list
3. Click "Import"

## Step 4: Configure Your Project

### Framework Preset
Vercel should automatically detect Next.js. If not, select:
- **Framework Preset:** Next.js

### Root Directory
Leave as default (root)

### Build Settings
Leave as default:
- **Build Command:** `npm run build` or `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## Step 5: Add Environment Variables

Click "Environment Variables" and add:

1. **NEXT_PUBLIC_TWELVE_DATA_API_KEY**
   - Value: `6d8e110e8f884e4782c3af257e57f7df`

2. **NEXT_PUBLIC_INSTANT_APP_ID**
   - Value: Your InstantDB App ID (from INSTANTDB_SETUP.md)

**Important:** Make sure to use `NEXT_PUBLIC_` prefix for client-side variables!

## Step 6: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## Step 7: Test Your Deployment

1. Open your deployed URL
2. Try signing up and logging in
3. Make a test trade
4. Check if prices are loading
5. Verify all charts are working

## Step 8: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Automatic Deployments

Vercel will automatically redeploy your app when you push to your Git repository:

- **Push to main branch:** Deploys to production
- **Push to other branches:** Creates preview deployments

## Monitoring and Logs

### View Logs
1. Go to your project in Vercel dashboard
2. Click "Deployments"
3. Click on a deployment
4. Click "Functions" to see logs

### View Analytics
Vercel provides free analytics:
1. Go to your project
2. Click "Analytics"
3. View page views, performance metrics, etc.

## Troubleshooting

### Build Failed

**Common issues:**

1. **Missing environment variables**
   - Make sure all env vars are added in Vercel settings
   - Check spelling and prefixes

2. **npm install errors**
   - Check package.json is valid
   - Try deleting node_modules and package-lock.json locally, then commit

3. **Build errors**
   - Review build logs in Vercel dashboard
   - Test build locally with `npm run build`

### App Not Loading

1. **Check browser console** for errors
2. **Verify environment variables** are set correctly
3. **Check InstantDB App ID** is correct
4. **Review Vercel function logs** for server errors

### API Errors

1. **Twelve Data API key** - verify it's correct
2. **Rate limits** - free tier has limits (8 calls/min)
3. **CORS issues** - should work automatically with Next.js API routes

### Authentication Issues

1. **InstantDB App ID** - double-check it's correct
2. **Browser cookies** - make sure they're enabled
3. **HTTPS** - InstantDB requires HTTPS (Vercel provides this automatically)

## Performance Optimization

### Enable Vercel Speed Insights
1. Go to project settings
2. Click "Speed Insights"
3. Enable for your project

### Enable Vercel Analytics
Already enabled by default for all deployments

### Edge Functions (Optional)
For faster API responses, you can deploy specific functions to the edge:
1. Create `middleware.js` in your project root
2. Configure edge runtime for specific routes

## Scaling

Vercel's free tier includes:
- **100GB bandwidth** per month
- **100 GB-hours** of serverless function execution
- **Unlimited** API requests

For higher traffic, consider upgrading to Pro plan.

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use Vercel's environment variables feature

2. **API Keys**
   - Keep Twelve Data API key in environment variables
   - Monitor usage in Twelve Data dashboard

3. **InstantDB**
   - Configure proper access rules in InstantDB dashboard
   - Review security settings regularly

## Updates and Maintenance

### Updating Your App
1. Make changes locally
2. Test thoroughly
3. Commit and push to Git
4. Vercel automatically deploys

### Rolling Back
1. Go to "Deployments" in Vercel
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Cost Estimates

**Free Tier Usage:**
- Development and small projects: FREE
- Up to 100GB bandwidth: FREE

**Potential Costs:**
- Twelve Data API: FREE (with limits)
- InstantDB: FREE tier available, check pricing for scale
- Vercel: FREE for personal projects

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)

## Support

If you encounter issues:
1. Check [Vercel Status](https://vercel-status.com)
2. Visit [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Review deployment logs in dashboard

---

🎉 Congratulations! Your RealPaperTrading Simulator is now live!

