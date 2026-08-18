# 🎓 Student Dropout Risk Detection System

> **Event-Driven EduTech Platform powered by Motia**

A production-ready, 100% dynamic system that tracks real student engagement and detects early dropout risk using event-driven workflows.

---

## 🌟 Social Impact

Educational dropouts are a critical challenge in modern education:
- **Early Detection**: Identifies at-risk students before it's too late
- **Data-Driven Intervention**: Enables timely mentoring and support
- **Scalable Solution**: Works for institutions of any size
- **Real-Time Monitoring**: Immediate alerts when risk levels change

This system helps educational institutions reduce dropout rates by providing actionable insights based on actual student behavior, not assumptions.

---

## ⚡ Why Motia? Event-Driven Architecture Advantage

Traditional systems process data synchronously, creating bottlenecks. This system leverages **Motia's event-driven architecture** for:

### **1. Decoupled Workflow Processing**
- Controllers only emit events, no business logic
- All processing happens asynchronously in isolated steps
- Easy to scale and maintain

### **2. Real-Time Risk Detection**
```
Student Event → Validate → Store → Analyze → Detect Risk → Notify
```
Every engagement event automatically triggers a complete risk assessment pipeline.

### **3. Extensibility**
Add new steps to the workflow without touching existing code:
- Add email notifications
- Integrate with SMS services
- Connect to external analytics
- Add machine learning models

### **4. Observability**
Every step logs its execution, making debugging and monitoring transparent.

---

## 🚀 Dynamic Data Philosophy

### ❌ What We DON'T Do:
- No pre-seeded students
- No mock data arrays
- No hardcoded scenarios
- No fake dashboards

### ✅ What We DO:
- **User Registration**: Every student/mentor/admin registers themselves
- **Real Events**: All data comes from actual user submissions
- **Live Monitoring**: Risk detection starts only when real events occur
- **Dynamic Dashboards**: All analytics computed from MongoDB in real-time

**This is not a demo. This is a production system.**

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐    │
│  │ Student  │  │  Mentor  │  │  Admin   │  │  Auth   │    │
│  │Dashboard │  │Dashboard │  │Dashboard │  │ Pages   │    │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
┌──────────────────────────▼──────────────────────────────────┐
│                    Backend (Express + Motia)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Authentication Middleware               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐   │
│  │   Auth   │  │ Student  │  │  Mentor  │  │  Admin  │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │ Routes  │   │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └─────────┘   │
│       │             │                                       │
│       │             │ motia.emit('STUDENT_EVENT')          │
│       │             ▼                                       │
│  ┌────┴─────────────────────────────────────────────┐     │
│  │           Motia Workflow Engine                   │     │
│  │  ┌──────────────────────────────────────────┐    │     │
│  │  │  StudentDropoutRiskWorkflow              │    │     │
│  │  │  1. validateStudentEvent                 │    │     │
│  │  │  2. storeEvent                           │    │     │
│  │  │  3. analyzeEngagement                    │    │     │
│  │  │  4. detectDropoutRisk                    │    │     │
│  │  │  5. notifyStudent                        │    │     │
│  │  │  6. notifyMentor                         │    │     │
│  │  └──────────────────────────────────────────┘    │     │
│  └───────────────────────┬───────────────────────────┘     │
└────────────────────────┬─┴─────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────┐
│                    MongoDB Database                        │
│  ┌─────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Users  │  │StudentProfile│  │ EngagementEvent  │    │
│  └─────────┘  └──────────────┘  └──────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

---

## 🧠 Risk Detection Logic

The system evaluates three key engagement metrics:

### **1. Attendance Tracking**
- **Medium Risk**: 3+ consecutive absences
- Resets to 0 when student attends

### **2. Assignment Completion**
- **High Risk**: 2+ missed assignments
- Tracks submitted vs. missed ratio

### **3. Academic Performance**
- **High Risk**: Average score < 40%
- Calculates average from all submitted test scores

Risk levels are recalculated after every event submission via the Motia workflow.

---

## 📦 Tech Stack

### Backend
- **Node.js** (LTS) - Runtime environment
- **Express** - Web framework
- **Motia** - Event-driven workflow engine
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **Recharts** - Data visualization

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+ and npm
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-dropout-system
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# MONGODB_URI=mongodb://localhost:27017/student-dropout-system
# JWT_SECRET=your-secret-key
# PORT=5000
# FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB
```bash
# If using local MongoDB:
mongod

# If using MongoDB Atlas, ensure your connection string is in backend/.env
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🚀 Deployment

### Backend Deployment (Render / Railway)

#### Option 1: Render
1. Create a new Web Service on [Render](https://render.com)
2. Connect your repository
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     ```
     MONGODB_URI=<your-mongodb-atlas-uri>
     JWT_SECRET=<random-secret-key>
     PORT=5000
     FRONTEND_URL=<your-frontend-url>
     NODE_ENV=production
     ```

#### Option 2: Railway
1. Create project on [Railway](https://railway.app)
2. Add MongoDB database (or use external MongoDB Atlas)
3. Deploy from GitHub
4. Add environment variables (same as above)

### Frontend Deployment (Vercel / Netlify)

#### Option 1: Vercel
```bash
cd frontend
npm run build

# Deploy using Vercel CLI
vercel --prod

# Or connect GitHub repo on vercel.com
```

**Environment Variables on Vercel:**
```
VITE_API_URL=<your-backend-url>/api
```

#### Option 2: Netlify
```bash
cd frontend
npm run build

# Deploy using Netlify CLI
netlify deploy --prod --dir=dist

# Or drag-and-drop dist/ folder on netlify.com
```

**Netlify environment variables:**
```
VITE_API_URL=<your-backend-url>/api
```

### MongoDB Atlas Setup
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string and add to backend environment variables

---

## 📖 Usage Guide

### For Students
1. **Register** with your details (name, email, course, year)
2. **Login** to access your dashboard
3. **Submit engagement events**:
   - Mark attendance (Present/Absent)
   - Submit assignment status
   - Record test scores
4. **Monitor your risk level** and follow recommendations

### For Mentors
1. **Register** as a mentor
2. **View all students** sorted by risk level
3. **Filter students** by risk category
4. **View detailed student profiles** and engagement history
5. **Receive alerts** for high-risk students

### For Admins
1. **Register** as an admin
2. **View institution-wide statistics**:
   - Total users (students/mentors/admins)
   - Risk distribution
   - Engagement metrics
   - Average performance indicators
3. **Monitor high-risk students** requiring immediate intervention

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Student Routes (Protected)
- `POST /api/student/event` - Submit engagement event (triggers Motia workflow)
- `GET /api/student/dashboard` - Get student dashboard data

### Mentor Routes (Protected)
- `GET /api/mentor/dashboard` - Get all students with risk data
- `GET /api/mentor/student/:studentId` - Get detailed student information

### Admin Routes (Protected)
- `GET /api/admin/overview` - Get institution-wide statistics

---

## 🎯 Motia Workflow Details

### Workflow: `StudentDropoutRiskWorkflow`
**Trigger**: `STUDENT_EVENT`

### Step-by-Step Execution:

1. **validateStudentEvent**
   - Verifies student exists and is valid
   - Validates event type and data structure
   - Returns validated event data

2. **storeEvent**
   - Creates EngagementEvent document in MongoDB
   - Timestamps the event
   - Returns event ID

3. **analyzeEngagement**
   - Fetches or creates StudentProfile
   - Updates statistics based on event type
   - Calculates running averages

4. **detectDropoutRisk**
   - Applies risk detection rules
   - Updates risk level and reasons
   - Returns risk assessment

5. **notifyStudent**
   - Generates student notification if at risk
   - Provides personalized recommendations
   - (In production: sends email/SMS)

6. **notifyMentor**
   - Alerts mentors if risk level changed to Medium/High
   - Includes student details and action items
   - (In production: sends email/SMS)

---

## 🎨 UI/UX Highlights

- **Modern SaaS Design**: Clean, professional interface
- **Calm Color Palette**: Blue/green focus for educational context
- **Responsive**: Works on desktop, tablet, and mobile
- **Real-time Feedback**: Instant updates after event submission
- **Color-coded Risk Badges**: Visual risk level indicators
- **Interactive Charts**: Performance and engagement trends
- **Role-based Dashboards**: Tailored experience for each user type

---

## 🏆 Hackathon Pitch

### Problem
**25-30% of college students drop out**, often due to undetected early warning signs.

### Solution
A **real-time, event-driven monitoring system** that:
- Tracks student engagement automatically
- Detects dropout risk using data science
- Alerts mentors for timely intervention
- Scales across institutions

### Innovation
- **Event-Driven Architecture**: Powered by Motia for scalability
- **100% Dynamic**: No mock data, real user-driven analytics
- **Production-Ready**: JWT auth, MongoDB, proper error handling
- **Beautiful UX**: Clean, modern interface built with React + Tailwind

### Impact
- Reduces dropout rates through early intervention
- Saves institutional resources
- Improves student success metrics
- Empowers data-driven decision making

### Tech Highlights
- Modern MERN stack with Motia
- Modular, extensible architecture
- Real-time risk calculation
- Role-based access control

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Middleware-based authorization
- **Role-Based Access**: Students/Mentors/Admins have different permissions
- **Environment Variables**: Sensitive data not in code
- **Input Validation**: All API inputs validated

---

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'mentor' | 'admin',
  course: String (for students),
  year: Number (for students),
  createdAt: Date
}
```

### StudentProfile
```javascript
{
  userId: ObjectId (ref: User),
  riskLevel: 'Low' | 'Medium' | 'High',
  riskReason: String,
  statistics: {
    totalAttendance: Number,
    presentCount: Number,
    absentCount: Number,
    consecutiveAbsences: Number,
    assignmentsSubmitted: Number,
    assignmentsMissed: Number,
    averagePerformance: Number,
    performanceScores: [Number]
  },
  lastUpdated: Date
}
```

### EngagementEvent
```javascript
{
  studentId: ObjectId (ref: User),
  eventType: 'attendance' | 'assignment' | 'performance',
  eventData: {
    status: 'present' | 'absent',     // for attendance
    submitted: Boolean,                 // for assignment
    assignmentName: String,
    score: Number (0-100),             // for performance
    testName: String
  },
  processed: Boolean,
  createdAt: Date
}
```

---

## 🧪 Testing the System

### Test Scenario: High-Risk Detection

1. **Register as a student**
2. **Submit 3 absences** consecutively → Risk becomes **Medium**
3. **Miss 2 assignments** → Risk escalates to **High**
4. **Submit a test score < 40%** → Remains **High** with multiple reasons
5. **Check mentor dashboard** → Student appears at top with high-risk badge

### Test Scenario: Risk Recovery

1. **Mark attendance as present** → Consecutive absences reset to 0
2. **Submit several assignments** → Assignment ratio improves
3. **Score 80% on test** → Average performance increases
4. **Risk level drops** → Student moves to Medium or Low risk

---

## 🤝 Contributing

This is a hackathon/educational project. To extend it:

1. **Add new risk factors** - Create new detection rules in `detectDropoutRisk.step.js`
2. **Add email notifications** - Integrate SendGrid/Nodemailer in notification steps
3. **Add ML predictions** - Create new Motia step for predictive analytics
4. **Add more visualizations** - Extend charts in dashboard components

---

## 📝 License

MIT License - Feel free to use this for educational purposes, hackathons, or real implementations.

---

## 👨‍💻 Built With

- ❤️ Passion for education technology
- ⚡ Motia event-driven architecture
- 🎯 Focus on real-world impact
- 🚀 Production-ready code quality

---

## 📧 Contact

For questions, feedback, or collaboration:
- Create an issue in this repository
- Fork and submit pull requests

---

## 🌟 Acknowledgments

- **Motia** for the powerful event-driven workflow engine
- **MongoDB** for flexible data storage
- **React** and **Tailwind CSS** for modern UI development

---

**Remember**: This system tracks real students with real engagement data. It's designed to make a difference in education, one student at a time. 🎓✨







