# ⚡ Quick Start Guide

Get the Student Dropout Risk Detection System running in **5 minutes**!

---

## 🎯 Prerequisites

Make sure you have installed:
- **Node.js** v18+ ([Download](https://nodejs.org))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community)) OR [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)
- **Git** ([Download](https://git-scm.com/downloads))

---

## 🚀 Option 1: Local MongoDB (Easiest for Development)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd student-dropout-system
```

### Step 2: Set Up Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Your .env should look like this:
# MONGODB_URI=mongodb://localhost:27017/student-dropout-system
# JWT_SECRET=motia-student-dropout-detection-super-secret-key-2024
# PORT=5000
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173
```

### Step 3: Set Up Frontend
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Create .env file (optional, uses default)
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 4: Start MongoDB (if using local)
```bash
# In a new terminal
mongod
```

### Step 5: Start Backend
```bash
# In the backend directory
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🔄 Motia initialized successfully
🚀 Server running on port 5000
```

### Step 6: Start Frontend
```bash
# In the frontend directory
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### Step 7: Open Your Browser
Go to **http://localhost:5173**

🎉 **You're ready!** Register a student account and start using the system.

---

## 🌐 Option 2: MongoDB Atlas (No Local MongoDB Required)

### Step 1: Create MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster (M0)
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (or your IP)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/student-dropout-system
   ```

### Step 2: Update Backend .env
```bash
cd backend

# Edit .env file
# Replace MONGODB_URI with your Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/student-dropout-system
```

### Step 3: Continue with Steps 3-7 from Option 1

---

## 🧪 Test the System

### 1. Register a Student
- Click **"Register"**
- Fill in details:
  - Name: John Doe
  - Email: john@example.com
  - Password: password123
  - Role: Student
  - Course: Computer Science
  - Year: 2

### 2. Submit Engagement Events

**Test Attendance:**
- Event Type: Attendance
- Status: Absent
- Submit 3 times → Your risk should become **Medium** 🟡

**Test Assignment:**
- Event Type: Assignment
- Assignment Name: Homework 1
- Status: Missed
- Submit 2 times → Your risk should become **High** 🔴

**Test Performance:**
- Event Type: Performance
- Test Name: Quiz 1
- Score: 35
- Submit → Your risk stays **High** 🔴

### 3. View Risk Status
Check your dashboard - you should see:
- Risk Badge showing **High Risk**
- Reasons listed
- Recommendations provided

### 4. Test Mentor Dashboard
- Logout
- Register as Mentor
- Login as mentor
- View student list
- Click "View Details" on John Doe
- See all events and risk status

### 5. Test Admin Dashboard
- Register as Admin
- View institution statistics
- See high-risk students list

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `MongoServerError: connect ECONNREFUSED`
**Fix**: Make sure MongoDB is running
```bash
# If using local MongoDB
mongod

# If using Atlas, check your connection string
```

**Error**: `Module not found: 'motia'`
**Fix**: Run `npm install` in backend directory

### Frontend won't start

**Error**: `EADDRINUSE: address already in use :::5173`
**Fix**: Port 5173 is busy. Close other Vite apps or change port:
```bash
npm run dev -- --port 3000
```

### Can't login after registration

**Fix**: 
1. Check backend terminal for errors
2. Verify MongoDB is running
3. Check browser console for errors

### CORS errors in browser

**Fix**: Verify `FRONTEND_URL` in backend/.env matches your frontend URL

---

## 📱 Access URLs

Once running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **MongoDB** (local): mongodb://localhost:27017

---

## 🎓 Next Steps

1. **Read the main README.md** for complete documentation
2. **Check WORKFLOW_DIAGRAM.md** to understand Motia workflows
3. **See DEPLOYMENT.md** for production deployment
4. **Experiment** with different engagement scenarios

---

## 💡 Pro Tips

1. **Keep 3 terminals open**:
   - Terminal 1: MongoDB (if local)
   - Terminal 2: Backend (`npm run dev`)
   - Terminal 3: Frontend (`npm run dev`)

2. **Use MongoDB Compass** to view database visually:
   - Download: https://www.mongodb.com/products/compass
   - Connect to: `mongodb://localhost:27017`

3. **Check backend logs** to see Motia workflow execution in real-time

4. **Use browser DevTools** (F12) to debug frontend issues

---

## 🆘 Still Having Issues?

1. Make sure all prerequisites are installed
2. Check that no other apps are using ports 5000 or 5173
3. Verify Node.js version: `node --version` (should be v18+)
4. Clear npm cache: `npm cache clean --force`
5. Delete `node_modules` and run `npm install` again

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend opens in browser
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can submit engagement events
- [ ] Risk level updates correctly
- [ ] Dashboard shows data
- [ ] Mentor dashboard works
- [ ] Admin dashboard works

If all checked ✅ - **Congratulations! You're ready to use the system!** 🎉

---

**Need help?** Check the main README.md or create an issue on GitHub.

Happy coding! 💻✨







