# PCAS — Placement Capability Analysis System

A fully integrated AI-powered placement readiness platform with ML-based PRS scoring, skill gap analysis, and personalized roadmaps.

## Project Structure
```
PCAS New/
├── client/          # React + Vite + Tailwind CSS frontend
├── server/          # Node.js + Express REST API
└── ml-service/      # Python FastAPI ML engine
```

---

## 🚀 Quick Start (Run all 3 services)

### 1. Start MongoDB
Make sure MongoDB is running locally (port 27017), or update `MONGO_URI` in `server/.env`.

### 2. ML Service (Python)
```powershell
cd "PCAS New\ml-service"
pip install -r requirements.txt
python model\train.py           # Train the PRS model (one-time)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
ML API available at: **http://localhost:8000**

### 3. Backend (Node.js)
```powershell
cd "PCAS New\server"
# Edit .env if needed (MONGO_URI, JWT_SECRET, ML_SERVICE_URL)
npm run dev
```
Backend API available at: **http://localhost:5000**

### 4. Frontend (React)
```powershell
cd "PCAS New\client"
npm run dev
```
Frontend available at: **http://localhost:5173**

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new student |
| POST | /api/auth/login | Login + get JWT |
| GET | /api/auth/me | Get current user |
| GET | /api/profile | Get student profile |
| POST | /api/profile | Create/update profile (triggers ML) |
| POST | /api/profile/resume | Upload resume + extract skills |
| GET | /api/analysis | Get PRS analysis + radar data |
| GET | /api/roadmap | Get personalized roadmap |
| POST | /api/roadmap/generate | Generate/regenerate roadmap |
| PATCH | /api/roadmap/task/:id | Toggle task completion |
| POST | /api/assistant/chat | AI assistant chat |
| GET | /api/report/download | Download PDF report |

## ML Service Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Health check |
| POST | /predict | Predict PRS score from features |
| POST | /extract-skills | Extract skills from uploaded resume |
| POST | /generate-roadmap | Generate personalized task list |

---

## Data Flow
```
Student fills Skill Profile
  → POST /api/profile (Node.js)
    → POST /predict (FastAPI ML)
      → Decision Tree Model
        → PRS Score + Classification + Feature Scores
          → Stored in MongoDB
            → Dashboard, Analysis, Roadmap updated dynamically
```

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS (matching Figma UI)
- **Backend**: Node.js + Express + JWT + Multer + PDFKit
- **Database**: MongoDB + Mongoose
- **ML Service**: Python 3.10+ + FastAPI + scikit-learn + pdfminer

## PRS Score Classification
| Score | Classification |
|-------|----------------|
| 0 – 39 | Beginner |
| 40 – 69 | Intermediate |
| 70 – 100 | Placement Ready |
