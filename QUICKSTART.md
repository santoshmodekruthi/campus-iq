# CAMPUS IQ quick start

## 1. Configure MongoDB and backend credentials

From the project root, copy the example only when the local environment file is absent:

```powershell
if (-not (Test-Path .\backend\.env)) { Copy-Item .\backend\.env.example .\backend\.env }
```

Edit `backend/.env`. Set `MONGODB_URI`, a private `JWT_SECRET` with at least 32 characters, `ADMIN_USERNAME`, an `ADMIN_PASSWORD` with at least 12 characters, and `FRONTEND_ORIGIN=http://localhost:5173`. A local MongoDB server or accessible Atlas database is required.

## 2. Install backend dependencies, test, and seed

```powershell
Set-Location "C:\Users\SANTOSH\OneDrive\Documents\student risk detection\EduRiskMonitor\backend"
npm ci
npm test
npm run seed:admin
npm run seed:students
npm run dev
```

The student seed generates a total of 1,000 synthetic records (100 per fixed college) and verifies the cohort. Each seeded student's first password is the date of birth in `DDMMYYYY` format, and the portal requires a password change after first sign-in. Rerunning either seed does not reset collections or overwrite existing records.

## 3. Start the existing Vite frontend

Open a second PowerShell terminal:

```powershell
Set-Location "C:\Users\SANTOSH\OneDrive\Documents\student risk detection\EduRiskMonitor\frontend"
npm ci
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`).

## Portal URLs

- Student Portal: `/login/student`
- Admin Portal: `/login/admin`
- Student account registration: `/register`

Admin credentials are created from backend environment variables and are never sent to the frontend. Do not add real credentials to a frontend `.env` file or commit `backend/.env`.
