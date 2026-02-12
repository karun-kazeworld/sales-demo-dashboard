# Project Setup Guide - Sales Performance Dashboard

## 🚀 Complete Deployment Setup (February 12, 2026)

This document contains all the commands, configurations, and steps performed to deploy the Sales Performance Dashboard to production.

## 📋 Prerequisites

- Node.js 18+
- Git installed
- GitHub account
- Vercel account (free)
- Supabase project (already configured)

## 🔧 Local Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/karun-kazeworld/sales-demo-dashboard.git
cd sales-demo-dashboard
npm install
```

### 2. Environment Variables
Create `.env` file:
```env
REACT_APP_SUPABASE_URL=https://xxbdrtsowaawgsbbfqlt.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YmRydHNvd2Fhd2dzYmJmcWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzczNjcsImV4cCI6MjA4NTk1MzM2N30.btrYMEDKs7A9Htc2_TFThD1dCqz9diHtMG9TtbwQTEg
```

### 3. Start Development Server
```bash
npm start
```
App opens at: http://localhost:3000

## 🐙 GitHub Repository Setup

### 1. Initialize Git Repository
```bash
cd /home/karun/MyFiles/NewK/DemoDashboard
git init
git add .
git commit -m "Initial commit: Sales Performance Dashboard - Production Ready

- Multi-tenant React TypeScript dashboard
- Supabase backend integration
- Role-based access (Admin, Supervisor, Executive)
- Two domains: Automotive (Castrol) & Banking (SBI)
- Dynamic scoring schemas
- Responsive design
- All status badge issues resolved"
```

### 2. Create GitHub Repository
1. Go to **github.com**
2. Click **"New"** repository
3. Repository name: **`sales-demo-dashboard`**
4. Make it **Public** (required for free Vercel deployment)
5. **Don't** initialize with README (files already exist)
6. Click **"Create repository"**

### 3. Connect Local to GitHub
```bash
# Add remote origin
git remote add origin https://github.com/karun-kazeworld/sales-demo-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Authentication Setup
When prompted for credentials:
- **Username:** `karun-kazeworld`
- **Password:** Use **Personal Access Token** (not GitHub password)

**Create Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `repo` (full repository access)
4. Generate token → Copy and use as password

## 🚀 Vercel Deployment

### 1. Vercel Account Setup
1. Go to **vercel.com**
2. **Sign up with GitHub** (easiest option)
3. Authorize Vercel to access your repositories

### 2. Import Project from GitHub
1. **Vercel Dashboard** → **"New Project"**
2. **Import Git Repository** → Select `karun-kazeworld/sales-demo-dashboard`
3. **Configure Project:**
   - Framework Preset: **Create React App**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Don't deploy yet** - need to add environment variables first

### 3. Configure Environment Variables
In Vercel project settings → **Environment Variables**, add:

```
REACT_APP_SUPABASE_URL
https://xxbdrtsowaawgsbbfqlt.supabase.co

REACT_APP_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YmRydHNvd2Fhd2dzYmJmcWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzczNjcsImV4cCI6MjA4NTk1MzM2N30.btrYMEDKs7A9Htc2_TFThD1dCqz9diHtMG9TtbwQTEg
```

### 4. Deploy
Click **"Deploy"** - Vercel will build and deploy automatically.

## 🐛 Build Issues & Fixes

### Issue 1: ESLint Errors
**Problem:** Build failed with unused variable errors:
```
[eslint] 
src/components/dashboard/ExecutiveDashboard.tsx
  Line 8:7:  'getStatusColor' is assigned a value but never used
src/hooks/useConversations.ts
  Line 28:23:  'session' is assigned a value but never used
```

**Solution:** Remove unused variables:

**File:** `src/components/dashboard/ExecutiveDashboard.tsx`
```javascript
// Remove the entire getStatusColor function (lines 8-18)
// Keep only the export function ExecutiveDashboard() {...}
```

**File:** `src/hooks/useConversations.ts`
```javascript
// Change from:
const { data: { session } } = await supabase.auth.getSession();

// To:
await supabase.auth.getSession();
```

### Issue 2: Environment Variables Missing
**Problem:** App deployed but showed blank page

**Solution:** Added environment variables in Vercel dashboard (see step 3 above)

### Fix Commands
```bash
cd /home/karun/MyFiles/NewK/DemoDashboard

# Remove unused variables (done via file editing)
# Commit fixes
git add .
git commit -m "Remove unused variables to fix ESLint errors"
git push

# Vercel automatically redeploys
```

## 🌐 Production Deployment Result

### Live Application
- **Production URL:** https://sales-performance-dashboard-opal.vercel.app
- **Status:** ✅ Successfully deployed and accessible
- **Auto-Deploy:** ✅ Enabled (deploys on every GitHub push)

### Deployment Stack
- **Frontend Hosting:** Vercel (Free Tier)
- **Database:** Supabase PostgreSQL (Free Tier)
- **Authentication:** Supabase Auth
- **Version Control:** GitHub
- **CI/CD:** Automatic deployment from GitHub

### Demo Accounts (Live)
- **Automotive Executive:** `castrol.executive@demo.com`
- **Automotive Supervisor:** `automotive.supervisor@demo.com`  
- **Banking Executive:** `sbi.executive@demo.com`
- **Banking Supervisor:** `banking.supervisor@demo.com`

## 🔄 Ongoing Development Workflow

### Making Updates
```bash
# 1. Make changes locally
# 2. Test locally
npm start

# 3. Commit and push to GitHub
git add .
git commit -m "Your update description"
git push

# 4. Vercel automatically builds and deploys
# 5. Check live site for updates
```

### Manual Redeploy (if needed)
1. Go to **Vercel Dashboard** → Your Project
2. **Deployments** tab
3. Click **3 dots (⋯)** next to latest deployment
4. Select **"Redeploy"**

## 🛠️ Troubleshooting

### Build Failures
1. **Check build logs** in Vercel deployment details
2. **Common issues:**
   - ESLint errors (unused variables)
   - Missing environment variables
   - Import/export errors

### Blank Page After Deployment
1. **Check browser console** for JavaScript errors
2. **Verify environment variables** in Vercel settings
3. **Check Supabase connection** - ensure keys are correct

### GitHub Authentication Issues
1. **Use Personal Access Token** instead of password
2. **Check repository permissions** - must be public for free Vercel
3. **Verify remote URL:** `git remote -v`

## 📊 Performance & Monitoring

### Vercel Analytics
- Available in Vercel dashboard
- Shows page views, performance metrics
- Free tier includes basic analytics

### Supabase Monitoring
- Database usage in Supabase dashboard
- Auth metrics and user activity
- API request monitoring

## 🔐 Security Considerations

### Environment Variables
- ✅ `.env` file in `.gitignore` (not committed to GitHub)
- ✅ Production variables configured in Vercel dashboard
- ✅ Supabase keys are public-safe (anon key, not service key)

### Database Security
- ✅ Row Level Security (RLS) enabled in Supabase
- ✅ User authentication required for data access
- ✅ Role-based access control implemented

## 📈 Scaling & Upgrades

### Free Tier Limits
- **Vercel:** Unlimited deployments for public repos
- **Supabase:** 500MB database, 2 projects, 50MB file storage
- **GitHub:** Unlimited public repositories

### Upgrade Paths
- **Vercel Pro:** $20/month - Private repos, more bandwidth
- **Supabase Pro:** $25/month - More database storage, backups
- **Custom Domain:** Available on Vercel free tier

---

**✅ Deployment Complete:** https://sales-performance-dashboard-opal.vercel.app  
**📅 Deployed:** February 12, 2026  
**🔄 Status:** Production ready with auto-deploy enabled
