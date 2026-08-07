"""
PCAS ML Service — FastAPI Application
Provides PRS prediction, skill extraction from resumes, and roadmap generation.
"""

import os
import io
import re
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# ── App setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="PCAS ML Service",
    description="Placement Capability Analysis System — Machine Learning API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load pre-trained model ───────────────────────────────────────────────────
MODEL_DIR   = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH  = os.path.join(MODEL_DIR, "prs_model.pkl")
META_PATH   = os.path.join(MODEL_DIR, "model_meta.pkl")

pipeline = None
model_meta = None

def load_model():
    global pipeline, model_meta
    if os.path.exists(MODEL_PATH):
        pipeline   = joblib.load(MODEL_PATH)
        model_meta = joblib.load(META_PATH)
        print("[OK] ML model loaded successfully.")
    else:
        print("[WARNING] Model not found. Run: python model/train.py")

load_model()

# ── Helpers ──────────────────────────────────────────────────────────────────

def classify_prs(score: float) -> str:
    if score < 40:
        return "Beginner"
    elif score < 70:
        return "Intermediate"
    else:
        return "Placement Ready"


def generate_insights(features: dict, prs_score: float) -> List[str]:
    """Generate human-readable skill gap insights from feature values."""
    insights = []
    # Benchmarks (50th percentile of training data approximation)
    benchmarks = {
        "num_skills":       7,
        "project_count":    3,
        "project_level":    2,
        "internship_count": 1,
        "comm_score":       6,
        "cgpa":             7.5,
    }
    messages = {
        "num_skills":       ("Your technical skill set is below average. Add more relevant skills.", "Great technical skill breadth!"),
        "project_count":    ("Build more projects to demonstrate practical experience.", "Good project portfolio!"),
        "project_level":    ("Work on more advanced/complex projects to stand out.", "You are tackling challenging projects!"),
        "internship_count": ("Your internship experience is below average. Apply for internships.", "Strong internship experience!"),
        "comm_score":       ("Improve communication skills — practice presentations and discussions.", "Communication skills are strong!"),
        "cgpa":             ("Focus on improving your academic performance.", "Academic performance is good!"),
    }
    weights = {"internship_count": 3, "comm_score": 2, "num_skills": 2, "project_count": 1, "project_level": 1, "cgpa": 1}

    # Sort features by gap * weight
    gaps = {}
    for k, v in features.items():
        bench = benchmarks.get(k, 0)
        gap = bench - v
        if gap > 0:
            gaps[k] = gap * weights.get(k, 1)

    sorted_gaps = sorted(gaps.items(), key=lambda x: x[1], reverse=True)

    # Provide top 3 negative insights
    for key, _ in sorted_gaps[:3]:
        insights.append(messages[key][0])

    # Provide strengths for what's above benchmark
    for k, v in features.items():
        if v > benchmarks.get(k, 0) + 1:
            insights.append(messages[k][1])
            break

    if not insights:
        insights.append("Your profile is well-rounded. Keep improving consistently!")

    return insights


def generate_roadmap_tasks(features: dict) -> List[dict]:
    """Generate personalized roadmap based on weak areas."""
    tasks = []
    benchmarks = {
        "num_skills": 7, "project_count": 3, "project_level": 2,
        "internship_count": 1, "comm_score": 6
    }

    if features.get("num_skills", 10) < benchmarks["num_skills"]:
        tasks += [
            {"title": "Complete 5 LeetCode Medium problems (Arrays & Strings)", "category": "Coding Practice", "priority": "High"},
            {"title": "Learn a new framework relevant to your domain", "category": "Coding Practice", "priority": "Medium"},
            {"title": "Complete an online certification (AWS/GCP/Azure)", "category": "Coding Practice", "priority": "Medium"},
        ]

    if features.get("project_count", 5) < benchmarks["project_count"] or features.get("project_level", 3) < benchmarks["project_level"]:
        tasks += [
            {"title": "Build a full-stack project and deploy it to the cloud", "category": "Projects", "priority": "High"},
            {"title": "Contribute to an open-source project on GitHub", "category": "Projects", "priority": "Medium"},
        ]

    if features.get("internship_count", 2) < benchmarks["internship_count"]:
        tasks += [
            {"title": "Apply to 10 internship positions on LinkedIn/Internshala", "category": "Internships", "priority": "High"},
            {"title": "Prepare a tailored resume for each role", "category": "Internships", "priority": "Medium"},
            {"title": "Schedule informational interviews with professionals", "category": "Internships", "priority": "Low"},
        ]

    if features.get("comm_score", 8) < benchmarks["comm_score"]:
        tasks += [
            {"title": "Record 1 mock interview and review your responses", "category": "Communication", "priority": "High"},
            {"title": "Join a Toastmasters club or debate session", "category": "Communication", "priority": "Medium"},
            {"title": "Practice the STAR method for behavioural questions", "category": "Communication", "priority": "Medium"},
        ]

    # Always add fundamentals
    tasks += [
        {"title": "Master Data Structures and Algorithms fundamentals", "category": "Coding Practice", "priority": "High"},
        {"title": "Prepare for system design interviews", "category": "Interview Prep", "priority": "Medium"},
    ]

    return tasks


# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class PRSInput(BaseModel):
    numSkills:       int
    projectCount:    int
    projectLevel:    int   # 1=Beginner, 2=Intermediate, 3=Advanced
    internshipCount: int
    commScore:       float  # 1–10
    cgpa:            Optional[float] = 7.5   # default if not provided


class PRSOutput(BaseModel):
    prsScore:       float
    classification: str
    insights:       List[str]
    featureScores:  dict


class RoadmapInput(BaseModel):
    numSkills:       int
    projectCount:    int
    projectLevel:    int
    internshipCount: int
    commScore:       float


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "ok", "service": "PCAS ML Service", "model_loaded": pipeline is not None}


@app.post("/predict", response_model=PRSOutput)
def predict_prs(data: PRSInput):
    """Predict PRS score from student profile features."""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run model/train.py first.")

    features_dict = {
        "num_skills":       data.numSkills,
        "project_count":    data.projectCount,
        "project_level":    data.projectLevel,
        "internship_count": data.internshipCount,
        "comm_score":       data.commScore,
        "cgpa":             data.cgpa,
    }

    feature_array = np.array([[
        data.numSkills,
        data.projectCount,
        data.projectLevel,
        data.internshipCount,
        data.commScore,
        data.cgpa,
    ]])

    raw_score = float(pipeline.predict(feature_array)[0])
    prs_score = round(min(max(raw_score, 0), 100), 1)
    classification = classify_prs(prs_score)
    insights = generate_insights(features_dict, prs_score)

    # Compute normalised feature scores (0–100) for radar chart
    feature_scores = {
        "technical":    min(round(data.numSkills / 15 * 100, 1), 100),
        "projects":     min(round((data.projectCount * data.projectLevel) / 20 * 100, 1), 100),
        "internships":  min(round(data.internshipCount / 4 * 100, 1), 100),
        "communication":round(data.commScore * 10, 1),
        "academics":    round((data.cgpa - 5) / 5 * 100, 1) if data.cgpa else 50,
    }

    return PRSOutput(
        prsScore=prs_score,
        classification=classification,
        insights=insights,
        featureScores=feature_scores,
    )


@app.post("/extract-skills")
async def extract_skills(file: UploadFile = File(...)):
    """Extract skills and keywords from an uploaded resume (PDF/DOCX/TXT)."""
    content = await file.read()
    text = ""

    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            from pdfminer.high_level import extract_text_to_fp
            from pdfminer.layout import LAParams
            output = io.StringIO()
            extract_text_to_fp(io.BytesIO(content), output, laparams=LAParams())
            text = output.getvalue()
        elif filename.endswith(".docx"):
            from docx import Document
            doc = Document(io.BytesIO(content))
            text = "\n".join([p.text for p in doc.paragraphs])
        else:
            text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Extract skills using keyword matching
    tech_keywords = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "Express",
        "MongoDB", "PostgreSQL", "MySQL", "SQL", "Docker", "Kubernetes",
        "AWS", "GCP", "Azure", "Git", "Linux", "Java", "C++", "C#",
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
        "scikit-learn", "Pandas", "NumPy", "FastAPI", "Flask", "Django",
        "REST API", "GraphQL", "Redis", "Kafka", "Spark", "Hadoop",
        "HTML", "CSS", "Vue.js", "Angular", "Next.js", "Spring Boot",
        "Figma", "Tailwind", "Bootstrap", "SASS", "Webpack", "Vite",
        "CI/CD", "Jenkins", "GitHub Actions", "Terraform", "Ansible",
        "Swift", "Kotlin", "Flutter", "React Native", "Android", "iOS",
        "Data Structures", "Algorithms", "System Design", "Microservices",
    ]

    found_skills = []
    text_lower = text.lower()
    for skill in tech_keywords:
        if skill.lower() in text_lower:
            found_skills.append(skill)

    # Extract email
    emails = re.findall(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}', text)
    # Extract phone
    phones = re.findall(r'\+?[\d\s\-()]{10,}', text)

    return {
        "skills": found_skills,
        "rawText": text[:2000],  # first 2000 chars
        "email": emails[0] if emails else None,
        "totalSkillsFound": len(found_skills),
    }


@app.post("/generate-roadmap")
def generate_roadmap(data: RoadmapInput):
    """Generate a personalized roadmap based on student's weak areas."""
    features = {
        "num_skills":       data.numSkills,
        "project_count":    data.projectCount,
        "project_level":    data.projectLevel,
        "internship_count": data.internshipCount,
        "comm_score":       data.commScore,
    }
    tasks = generate_roadmap_tasks(features)
    categories = list(set(t["category"] for t in tasks))
    return {
        "tasks": tasks,
        "totalTasks": len(tasks),
        "categories": categories,
    }
