# CAMPUS IQ

**AI-Powered Student Analytics and Success Platform**

CAMPUS IQ is the existing React + Vite and Express + MongoDB student-success application. It provides two portals: Student Portal and Admin Portal. Academic risk is calculated using the explainable rules in `backend/services/analytics.js`; there is no claim of a separately trained machine-learning model.

## Requirements

- Node.js 18 or newer
- MongoDB (local instance or Atlas)
- npm

## Configure the backend

From the project root, create the local environment file only if it does not already exist:

```powershell
if (-not (Test-Path .\backend\.env)) { Copy-Item .\backend\.env.example .\backend\.env }
```

Edit `backend/.env` and set:

- `MONGODB_URI` to the MongoDB database URI
- `JWT_SECRET` to a private random value of at least 32 characters
- `ADMIN_USERNAME` and a unique `ADMIN_PASSWORD` of at least 12 characters
- `FRONTEND_ORIGIN` to the frontend origin (normally `http://localhost:5173`)
- `PORT` if port 5000 is unavailable

The example file is not a production credential file. Never commit `backend/.env`.

## Install, test, and seed

In a PowerShell terminal:

```powershell
Set-Location "C:\Users\SANTOSH\OneDrive\Documents\student risk detection\EduRiskMonitor\backend"
npm ci
npm test
npm run seed:admin
npm run seed:students
```

The student seed creates 100 synthetic students for each of the fixed colleges (MBU, SRM, VIT, GMR, CBIT, NSRIT, RAGHU, ANITS, LPU, RIE). Registration numbers run from `<COLLEGE>001` through `<COLLEGE>100`; initial passwords are each student's synthetic date of birth in `DDMMYYYY` format. Seeded students must change the initial password at first sign-in.

The seed is additive and uses `$setOnInsert`; it does not clear collections or overwrite an existing record. It verifies that the intended 1,000-record cohort exists after running. If the database already contains conflicting accounts, the script reports a verification error rather than deleting or replacing them.

## Run the application

Start the backend in one terminal:

```powershell
Set-Location "C:\Users\SANTOSH\OneDrive\Documents\student risk detection\EduRiskMonitor\backend"
npm run dev
```

Start the frontend in another terminal:

```powershell
Set-Location "C:\Users\SANTOSH\OneDrive\Documents\student risk detection\EduRiskMonitor\frontend"
npm ci
npm run dev
```

Open the Vite URL printed in the frontend terminal (by default `http://localhost:5173`). The development server proxies `/api` requests to `http://localhost:5000`. For a separately hosted API, set `VITE_API_URL` to its `/api` base URL before building the frontend.

## Portals and access

- Student sign-in uses college, registration number, and password.
- Student self-registration accepts only the fixed college list and requires a matching registration-number prefix. Email and registration number are unique. It cannot claim an existing seeded account.
- Admin sign-in uses the backend-seeded administrator username and password. There is no public admin-registration endpoint.
- JWT-protected backend routes enforce student/admin roles. Students can see and update only their own basic profile fields; official academic data is read-only to students.
- Admin student edits, enrollment changes, and intervention notes are recorded in MongoDB audit logs.

## Risk rules

The shared backend assessment considers attendance, assignment completion, GPA, marks, and GPA decline. Warnings are generated for attendance below 75%, assignment completion below 70%, GPA below 6, marks below 50%, and declining GPA. Severe indicators (attendance below 60%, GPA below 5, or a mark below 40%) or at least three warning indicators produce High risk; other warnings produce Medium risk. The same assessment is stored with the student record and used by the student dashboard and admin analytics.

Student-submitted engagement events are explicitly self-reported. They are retained for the activity view and optional Motia workflow, but do not change official attendance, GPA, marks, or risk metrics.
