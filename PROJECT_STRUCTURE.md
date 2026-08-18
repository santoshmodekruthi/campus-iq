# 📁 Complete Project Structure

Visual overview of all files and their purposes.

```
student-dropout-system/
│
├── 📄 README.md                          # Main documentation
├── 📄 QUICKSTART.md                      # 5-minute setup guide
├── 📄 DEPLOYMENT.md                      # Production deployment guide
├── 📄 WORKFLOW_DIAGRAM.md                # Motia workflow visualization
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 📄 .gitignore                         # Git ignore patterns
├── 📄 package.json                       # Root package.json with helper scripts
│
├── 📂 backend/                           # Backend (Node.js + Express + Motia)
│   │
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 .env.example                   # Environment variables template
│   ├── 📄 index.js                       # Server entry point
│   │
│   ├── 📂 config/                        # Configuration files
│   │   ├── db.js                         # MongoDB connection setup
│   │   └── motia.js                      # Motia initialization
│   │
│   ├── 📂 models/                        # Mongoose schemas
│   │   ├── User.js                       # User model (students/mentors/admins)
│   │   ├── StudentProfile.js             # Student profile with risk data
│   │   └── EngagementEvent.js            # Student engagement events
│   │
│   ├── 📂 middleware/                    # Express middleware
│   │   └── auth.js                       # JWT authentication middleware
│   │
│   ├── 📂 routes/                        # Express route handlers
│   │   ├── auth.routes.js                # Authentication routes (register/login)
│   │   ├── student.routes.js             # Student routes (submit event, dashboard)
│   │   ├── mentor.routes.js              # Mentor routes (view students)
│   │   └── admin.routes.js               # Admin routes (institution overview)
│   │
│   └── 📂 motia/                         # Motia workflow engine
│       │
│       ├── 📂 workflows/                 # Workflow definitions
│       │   └── studentRisk.workflow.js   # Main dropout risk workflow
│       │
│       └── 📂 steps/                     # Workflow steps (business logic)
│           ├── validateStudentEvent.step.js    # Step 1: Validate event
│           ├── storeEvent.step.js              # Step 2: Store in DB
│           ├── analyzeEngagement.step.js       # Step 3: Update statistics
│           ├── detectDropoutRisk.step.js       # Step 4: Detect risk level
│           ├── notifyStudent.step.js           # Step 5: Student notification
│           └── notifyMentor.step.js            # Step 6: Mentor notification
│
└── 📂 frontend/                          # Frontend (React + Vite + Tailwind)
    │
    ├── 📄 package.json                   # Frontend dependencies
    ├── 📄 vite.config.js                 # Vite configuration
    ├── 📄 tailwind.config.js             # Tailwind CSS configuration
    ├── 📄 postcss.config.js              # PostCSS configuration
    ├── 📄 index.html                     # HTML entry point
    │
    └── 📂 src/                           # Source code
        │
        ├── 📄 main.jsx                   # React entry point
        ├── 📄 App.jsx                    # Main app component with routing
        ├── 📄 index.css                  # Global styles (Tailwind imports)
        │
        ├── 📂 services/                  # API service layer
        │   └── api.js                    # Axios setup + API functions
        │
        ├── 📂 components/                # Reusable components
        │   ├── Navbar.jsx                # Navigation bar
        │   ├── RiskBadge.jsx             # Risk level badge component
        │   ├── EngagementForm.jsx        # Form to submit events
        │   └── EngagementChart.jsx       # Charts for engagement data
        │
        └── 📂 pages/                     # Page components
            ├── Register.jsx              # User registration page
            ├── Login.jsx                 # User login page
            ├── StudentDashboard.jsx      # Student dashboard
            ├── MentorDashboard.jsx       # Mentor dashboard
            └── AdminDashboard.jsx        # Admin dashboard
```

---

## 📊 File Statistics

### Backend
- **Configuration**: 2 files
- **Models**: 3 files
- **Routes**: 4 files
- **Middleware**: 1 file
- **Motia Steps**: 6 files
- **Motia Workflows**: 1 file
- **Total Backend Files**: 18 files

### Frontend
- **Pages**: 5 files
- **Components**: 4 files
- **Services**: 1 file
- **Configuration**: 4 files
- **Total Frontend Files**: 15 files

### Documentation
- **README.md**: Main documentation
- **QUICKSTART.md**: Fast setup guide
- **DEPLOYMENT.md**: Production deployment
- **WORKFLOW_DIAGRAM.md**: Architecture diagrams
- **PROJECT_STRUCTURE.md**: This file
- **Total Documentation**: 5 files

**Grand Total: 38 files** 📂

---

## 🎯 Key File Purposes

### Backend Core Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `index.js` | Server entry point | Express setup, middleware, route mounting |
| `config/db.js` | Database connection | MongoDB connection with error handling |
| `config/motia.js` | Motia initialization | Workflow engine setup |

### Models

| File | Purpose | Schema Fields |
|------|---------|---------------|
| `User.js` | User authentication | email, password, role, course, year |
| `StudentProfile.js` | Student risk data | riskLevel, statistics, riskReason |
| `EngagementEvent.js` | Event tracking | eventType, eventData, timestamp |

### Motia Workflow Steps

| Step | Purpose | Input | Output |
|------|---------|-------|--------|
| `validateStudentEvent` | Data validation | Raw event | Validated event |
| `storeEvent` | Database persistence | Validated event | Event document |
| `analyzeEngagement` | Statistics update | Event + Profile | Updated profile |
| `detectDropoutRisk` | Risk calculation | Profile + Stats | Risk level |
| `notifyStudent` | Student alert | Risk data | Notification |
| `notifyMentor` | Mentor alert | Risk data | Notification |

### Frontend Pages

| Page | Route | Purpose | Accessible By |
|------|-------|---------|---------------|
| `Register.jsx` | `/register` | User registration | Public |
| `Login.jsx` | `/login` | User login | Public |
| `StudentDashboard.jsx` | `/dashboard` | Student view | Students only |
| `MentorDashboard.jsx` | `/dashboard` | Mentor view | Mentors only |
| `AdminDashboard.jsx` | `/dashboard` | Admin view | Admins only |

### Frontend Components

| Component | Purpose | Used In |
|-----------|---------|---------|
| `Navbar.jsx` | Navigation header | All dashboards |
| `RiskBadge.jsx` | Risk level display | All dashboards |
| `EngagementForm.jsx` | Event submission | Student dashboard |
| `EngagementChart.jsx` | Data visualization | Student dashboard |

---

## 🔄 Data Flow Example

### Student Submits Attendance Event

```
User clicks "Submit" in EngagementForm.jsx
         ↓
api.js → POST /api/student/event
         ↓
student.routes.js → motia.emit('STUDENT_EVENT')
         ↓
studentRisk.workflow.js (triggers 6 steps)
         ↓
validateStudentEvent.step.js → validates data
         ↓
storeEvent.step.js → saves to EngagementEvent collection
         ↓
analyzeEngagement.step.js → updates StudentProfile statistics
         ↓
detectDropoutRisk.step.js → calculates risk level
         ↓
notifyStudent.step.js → generates notification
         ↓
notifyMentor.step.js → alerts mentors
         ↓
Response → Back to StudentDashboard.jsx
         ↓
Dashboard reloads → Shows updated risk level
```

---

## 🗄️ Database Collections

### 1. users
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  role: "student",
  course: "Computer Science",
  year: 2,
  createdAt: ISODate
}
```

### 2. studentprofiles
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  riskLevel: "High",
  riskReason: "3 consecutive absences, 2 missed assignments",
  statistics: {
    totalAttendance: 10,
    presentCount: 7,
    absentCount: 3,
    consecutiveAbsences: 3,
    assignmentsSubmitted: 5,
    assignmentsMissed: 2,
    averagePerformance: 65.5,
    performanceScores: [70, 65, 80, 55, 60]
  },
  lastUpdated: ISODate,
  createdAt: ISODate
}
```

### 3. engagementevents
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  eventType: "attendance",
  eventData: {
    status: "absent"
  },
  processed: true,
  createdAt: ISODate
}
```

---

## 🔐 Environment Variables

### Backend (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/student-dropout-system
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Dependencies

### Backend Dependencies
```json
{
  "express": "^4.18.2",           // Web framework
  "motia": "^1.0.0",              // Workflow engine
  "mongoose": "^8.0.3",           // MongoDB ORM
  "bcryptjs": "^2.4.3",           // Password hashing
  "jsonwebtoken": "^9.0.2",       // JWT authentication
  "dotenv": "^16.3.1",            // Environment variables
  "cors": "^2.8.5"                // CORS middleware
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",             // UI library
  "react-dom": "^18.2.0",         // React DOM
  "react-router-dom": "^6.20.1",  // Routing
  "axios": "^1.6.2",              // HTTP client
  "recharts": "^2.10.3",          // Charts
  "tailwindcss": "^3.3.6",        // CSS framework
  "vite": "^5.0.8"                // Build tool
}
```

---

## 🎨 Color Scheme

### Tailwind Color Usage
- **Primary (Blue)**: `blue-600`, `blue-500` - Main brand color
- **Success (Green)**: `green-600` - Low risk, positive actions
- **Warning (Yellow)**: `yellow-600` - Medium risk
- **Danger (Red)**: `red-600` - High risk, errors
- **Purple**: `purple-600` - Mentor role, performance metrics
- **Gray**: `gray-50` to `gray-900` - Neutral UI elements

---

## 🚀 Extending the System

### Add New Event Type (e.g., "participation")

1. **Update EngagementEvent model**:
   ```javascript
   eventType: {
     enum: ['attendance', 'assignment', 'performance', 'participation']
   }
   ```

2. **Add validation in validateStudentEvent.step.js**

3. **Add statistics in StudentProfile model**

4. **Add analysis logic in analyzeEngagement.step.js**

5. **Add risk rule in detectDropoutRisk.step.js**

6. **Update frontend EngagementForm.jsx**

No changes needed to:
- Workflow definition ✅
- Routes ✅
- Other steps ✅

---

## 📊 Code Metrics

- **Lines of Code** (estimated):
  - Backend: ~1,500 lines
  - Frontend: ~1,200 lines
  - Total: ~2,700 lines

- **API Endpoints**: 7 endpoints
- **React Components**: 9 components
- **Database Models**: 3 models
- **Motia Steps**: 6 steps

---

## 🎓 Architecture Patterns Used

1. **MVC Pattern** (Backend)
   - Models: MongoDB schemas
   - Views: JSON responses
   - Controllers: Express routes

2. **Event-Driven Architecture**
   - Motia workflow engine
   - Decoupled business logic

3. **Component-Based Architecture** (Frontend)
   - Reusable React components
   - Props-based data flow

4. **RESTful API**
   - Standard HTTP methods
   - JSON data format

5. **Token-Based Authentication**
   - JWT tokens
   - Protected routes

---

**This structure represents a production-ready, scalable, maintainable educational technology platform!** 🎓✨







