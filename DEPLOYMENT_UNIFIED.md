# Unified Deployment Guide - Deploy Together on Render

Deploy **both frontend and backend from one platform** using Render. The Express server will serve the built React app.

---

## Overview

Instead of:
- Backend on Render + Frontend on Vercel + separate CORS config

You'll have:
- **One deployment on Render**
- Express serves built React files
- No CORS issues
- Single environment configuration

---

## Part 1: Prepare Your Project

### 1.1 Push to GitHub

```bash
cd c:\Users\anike\Desktop\NetAlgoVis
git init
git add .
git commit -m "NetAlgoVis - Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/netalgovis.git
git branch -M main
git push -u origin main
```

### 1.2 Update Backend to Serve Frontend

#### File: `server/app.js`

Add static file serving and fallback routing (add after all API routes):

```javascript
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... existing middleware and routes ...

// All existing routes above this line

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../client/dist")));

// Fallback to index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

export { app };
```

**This allows Express to:**
1. Serve all static assets (CSS, JS, images)
2. Handle client-side routing by returning index.html for unknown routes

---

## Part 2: Update package.json

### `server/package.json`

Ensure scripts are correct:

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "build": "cd ../client && npm install && npm run build",
    "test": "node --test"
  },
  "engines": {
    "node": "20.x"
  }
}
```

The `"build"` script builds the frontend during deployment.

---

## Part 3: Create .env for Production

### File: `server/.env.production`

Create production configuration:

```env
PORT=8000
CORS_ORIGIN=*
MONGODB_URI=your-mongodb-atlas-uri-here
ACCESS_TOKEN_SECRET=your-random-secret-here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-random-refresh-secret-here
REFRESH_TOKEN_EXPIRY=10d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URI=https://your-app-name.onrender.com/api/v1/auth/google/callback
NODE_ENV=production
VITE_VITE_API_URL=/api/v1
```

**Note:** `CORS_ORIGIN=*` works because both frontend and backend are on the same server now.

---

## Part 4: Deploy on Render

### 4.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access repositories

### 4.2 Create Web Service

1. Dashboard → **New +** → **Web Service**
2. Select your `netalgovis` repository
3. Configure:

```
Name:                  netalgovis
Environment:           Node
Build Command:         cd server && npm install && npm run build && npm run start
Start Command:         cd server && npm start
Region:                Choose closest to you
```

### 4.3 Add Environment Variables

In Render dashboard, go to your service → **Environment**:

```
PORT=8000
CORS_ORIGIN=*
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=[generate random string]
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=[generate random string]
REFRESH_TOKEN_EXPIRY=10d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URI=https://your-app-name.onrender.com/api/v1/auth/google/callback
NODE_ENV=production
VITE_VITE_API_URL=/api/v1
```

### 4.4 Deploy

Click **Deploy**. Render will:
1. Install backend dependencies
2. Build the React frontend
3. Start the Express server
4. Serve both from one URL

Takes 3-5 minutes. Your live URL: `https://netalgovis.onrender.com`

---

## Part 5: Set Up MongoDB

### 5.1 Create MongoDB Atlas Cluster

1. Go to [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Sign up or login
3. **Create** → **Shared** (Free tier)
4. Choose region close to you
5. Click **Create**

### 5.2 Create Database User

1. **Database Access** → **Add New Database User**
   - Username: `netalgovis_user`
   - Password: Generate (copy it!)
   - Role: `Atlas Admin`

### 5.3 Allow Network Access

1. **Network Access** → **Add IP Address**
2. Add `0.0.0.0/0` (allow all)
3. Click **Confirm**

### 5.4 Get Connection String

1. Cluster → **Connect** → **Drivers**
2. Copy: `mongodb+srv://netalgovis_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
3. Replace `PASSWORD` with your database password
4. This is your `MONGODB_URI` → add to Render environment

---

## Part 6: Update Google OAuth

### 6.1 Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URI:
   ```
   https://your-app-name.onrender.com/api/v1/auth/google/callback
   ```
4. Copy `Client ID` and `Client Secret`

### 6.2 Add to Render

Update in Render environment variables:
- `GOOGLE_CLIENT_ID` = your Client ID
- `GOOGLE_CLIENT_SECRET` = your Client Secret
- `GOOGLE_CALLBACK_URI` = `https://your-app-name.onrender.com/api/v1/auth/google/callback`

---

## Part 7: Generate Secret Keys

Generate random secrets for JWT:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice and use the outputs for:
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

Add both to Render environment variables.

---

## Part 8: Testing

### Test After Deployment

1. Open `https://your-app-name.onrender.com`
2. Sign up with email/password
3. Try Google login
4. Create a topology
5. Run an algorithm
6. Check browser DevTools → Network tab

All API calls should go to `/api/v1/...` (same origin)

### Check Logs

Render dashboard → Your service → **Logs** tab
- See deployment progress
- See runtime errors

---

## Complete Checklist

### Before Deployment
- [ ] Push code to GitHub
- [ ] Updated `server/app.js` to serve React files
- [ ] Updated `server/package.json` build scripts
- [ ] Created `.env.production`

### During Deployment
- [ ] Created Render account
- [ ] Created Web Service on Render
- [ ] Created MongoDB Atlas cluster
- [ ] Generated random secret keys
- [ ] Added all environment variables

### After Deployment
- [ ] Render deployment successful
- [ ] Frontend loads
- [ ] Can sign up
- [ ] Can login (email/password)
- [ ] Can login (Google OAuth)
- [ ] Can create topology
- [ ] Can run algorithm
- [ ] No console errors

---

## Environment Variables Summary

### Render Dashboard → Environment Variables

```
PORT=8000
CORS_ORIGIN=*
MONGODB_URI=mongodb+srv://netalgovis_user:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=random-hex-string-here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=random-hex-string-here
REFRESH_TOKEN_EXPIRY=10d
GOOGLE_CLIENT_ID=920895604984-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URI=https://netalgovis.onrender.com/api/v1/auth/google/callback
NODE_ENV=production
VITE_VITE_API_URL=/api/v1
```

---

## File Structure After Deployment

```
Render Server (https://netalgovis.onrender.com)
├── /api/v1/*           → Express API routes
├── /static/*           → React build assets
└── /                   → React app (index.html)
```

All requests to `/` that don't match API routes serve `index.html` (React Router handles routing).

---

## Continuous Deployment

Every time you push to GitHub main branch:
1. Render detects change
2. Rebuilds frontend
3. Restarts backend
4. Deploys automatically

No manual deployment needed!

---

## Troubleshooting

### Deployment Fails
- Check Render logs for errors
- Verify `build` script works locally
- Ensure all dependencies are in package.json

### Frontend Not Loading
- Check Render logs for 404 errors
- Verify `server/app.js` has static file serving
- Check `VITE_VITE_API_URL=/api/v1` in environment

### API Calls Fail
- Check CORS_ORIGIN is set
- Check MONGODB_URI is correct
- Test with curl: `curl https://your-app-name.onrender.com/api/v1/health`

### OAuth Not Working
- Verify GOOGLE_CALLBACK_URI matches Google Cloud Console
- Check credentials in environment variables
- Verify redirect URI in browser matches expected

---

## Monitoring

### Render Logs
- Watch for errors: Render dashboard → Logs
- Check memory usage
- Monitor response times

### MongoDB Atlas
- Check connection count
- Monitor database size
- Set up alerts for quota

---

## Scaling Later

If needed:
- Upgrade Render plan (from Free to Paid)
- Upgrade MongoDB tier
- Add caching layer (Redis)
- Use CDN for static files

---

## Quick Reference

| What | Where |
|------|-------|
| Live App | `https://your-app-name.onrender.com` |
| API Calls | `https://your-app-name.onrender.com/api/v1` |
| Frontend Files | Served from Express |
| Backend | Express on Render |
| Database | MongoDB Atlas |

---

## Support

If something goes wrong:
1. Check Render logs (Logs tab)
2. Verify all environment variables
3. Test locally with same `.env` values
4. Check MongoDB Atlas connection
5. Verify GitHub repo is up to date
