# 🚀 Deployment Guide

Complete step-by-step guide for deploying the Student Dropout Risk Detection System to production.

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] Database and user configured
- [ ] Backend code tested locally
- [ ] Frontend code tested locally
- [ ] Environment variables prepared
- [ ] Hosting platform account created (Vercel/Netlify for frontend, Render/Railway for backend)

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### 2. Create a Cluster
1. Click **"Build a Database"**
2. Choose **FREE** tier (M0)
3. Select a cloud provider and region (closest to your users)
4. Name your cluster (e.g., `student-dropout-cluster`)
5. Click **"Create"**

### 3. Configure Database Access
1. Go to **Database Access** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `student-dropout-admin`
5. Password: Generate a secure password (save it!)
6. User Privileges: **"Atlas Admin"** or **"Read and write to any database"**
7. Click **"Add User"**

### 4. Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IP addresses of your hosting service
5. Click **"Confirm"**

### 5. Get Connection String
1. Go to **Database** (Deployments)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://student-dropout-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `...mongodb.net/student-dropout-system?retryWrites...`

**Final Connection String Example:**
```
mongodb+srv://student-dropout-admin:MySecurePass123@cluster0.abc123.mongodb.net/student-dropout-system?retryWrites=true&w=majority
```

---

## 🖥️ Step 2: Backend Deployment (Render)

### 1. Prepare Your Repository
Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 3. Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure the service:

**Basic Settings:**
- **Name**: `student-dropout-backend`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables:**
Click **"Advanced"** → **"Add Environment Variable"**

```
MONGODB_URI=mongodb+srv://student-dropout-admin:YourPassword@cluster0.xxxxx.mongodb.net/student-dropout-system?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-random-secret-key-change-this
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

4. Click **"Create Web Service"**

### 4. Wait for Deployment
- Render will build and deploy your backend
- Watch the logs for any errors
- Once deployed, you'll get a URL like: `https://student-dropout-backend.onrender.com`

### 5. Test Backend
```bash
curl https://student-dropout-backend.onrender.com/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

---

## 🌐 Step 3: Frontend Deployment (Vercel)

### 1. Prepare Frontend
Update `frontend/.env` with your backend URL:
```
VITE_API_URL=https://student-dropout-backend.onrender.com/api
```

Commit changes:
```bash
git add frontend/.env
git commit -m "Update API URL for production"
git push origin main
```

### 2. Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel

### 3. Deploy Frontend
1. Click **"Add New..."** → **"Project"**
2. Import your repository
3. Configure project:

**Framework Preset:** `Vite`
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`

4. Add Environment Variables:
```
VITE_API_URL=https://student-dropout-backend.onrender.com/api
```

5. Click **"Deploy"**

### 4. Wait for Deployment
- Vercel will build and deploy your frontend
- You'll get a URL like: `https://student-dropout-system.vercel.app`

### 5. Update Backend CORS
Go back to Render and update the `FRONTEND_URL` environment variable:
```
FRONTEND_URL=https://student-dropout-system.vercel.app
```

Render will automatically redeploy the backend.

---

## 🔐 Step 4: Security Hardening

### Backend Security
1. **Generate Strong JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Update Environment Variables** on Render with the generated secret

3. **Restrict MongoDB Network Access:**
   - In MongoDB Atlas → Network Access
   - Remove `0.0.0.0/0` if added
   - Add Render's IP addresses (check Render docs for IP ranges)

### Frontend Security
1. **Set up Custom Domain** (optional but recommended)
2. **Enable HTTPS** (automatic on Vercel)

---

## ✅ Step 5: Post-Deployment Verification

### 1. Test Registration
1. Go to your frontend URL
2. Click **"Register"**
3. Create a student account
4. Verify you can log in

### 2. Test Event Submission
1. Submit an attendance event
2. Submit an assignment event
3. Submit a performance event
4. Verify dashboard updates

### 3. Test Risk Detection
1. Submit 3 absences → Check risk becomes Medium
2. Miss 2 assignments → Check risk becomes High
3. Verify on both student and mentor dashboards

### 4. Test All Roles
1. Register as mentor → Verify mentor dashboard
2. Register as admin → Verify admin dashboard
3. Log in/out multiple times

---

## 🔄 Alternative Deployments

### Railway (Backend Alternative)

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub repo
3. Add environment variables (same as Render)
4. Railway automatically detects Node.js and deploys

### Netlify (Frontend Alternative)

1. Go to [Netlify](https://netlify.com)
2. Click **"Add new site"** → **"Import from Git"**
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Add environment variables
5. Deploy

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `MongoServerError: Authentication failed`
**Solution**: Check MongoDB Atlas credentials and connection string

**Problem**: `CORS Error`
**Solution**: Verify `FRONTEND_URL` is set correctly in backend environment

**Problem**: `Cannot find module 'motia'`
**Solution**: Ensure `npm install` runs in build command

### Frontend Issues

**Problem**: `Failed to fetch` or `Network Error`
**Solution**: Check `VITE_API_URL` is correct and backend is running

**Problem**: `404 on refresh`
**Solution**: Add `vercel.json` with rewrites (already handled by Vercel for SPA)

### Database Issues

**Problem**: `Connection timeout`
**Solution**: 
1. Check Network Access whitelist in MongoDB Atlas
2. Verify connection string format
3. Check if cluster is active

---

## 📊 Monitoring Production

### Backend Monitoring (Render)
1. Go to your service dashboard
2. Click **"Logs"** to see real-time logs
3. Check for errors or warnings

### Frontend Monitoring (Vercel)
1. Go to your project dashboard
2. Click **"Deployments"** for build logs
3. Check **"Analytics"** for usage stats

### Database Monitoring (MongoDB Atlas)
1. Go to your cluster
2. Check **"Metrics"** for performance
3. View **"Data Explorer"** to see actual data

---

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

1. **Push to GitHub** → Automatic deployment triggered
2. **View build logs** in respective dashboards
3. **Rollback** if needed (available in both platforms)

---

## 💰 Cost Estimates

### Free Tier Limits
- **MongoDB Atlas**: 512 MB storage (good for ~1000-5000 students)
- **Render**: Free tier with some limitations (sleeps after inactivity)
- **Vercel**: Unlimited bandwidth for hobby projects

### Scaling Costs
When you need to scale:
- **MongoDB Atlas**: Paid plans start at ~$10/month
- **Render**: Paid plans start at $7/month (no sleep)
- **Vercel**: Paid plans start at $20/month (more features)

---

## 🎉 You're Live!

Your Student Dropout Risk Detection System is now in production! 🚀

**Share your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.onrender.com`
- API Health: `https://your-api.onrender.com/health`

---

## 📞 Support

If you encounter issues:
1. Check the logs on your hosting platform
2. Verify environment variables
3. Test MongoDB connection separately
4. Review the main README.md for system architecture

Good luck! 🎓✨







