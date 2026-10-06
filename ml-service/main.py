"""
PCAS ML Service — FastAPI Application
Provides placement prediction using the trained best model (StandardScaler + LogisticRegression),
skill extraction from resumes, and actionable roadmap generation.
"""

import os
import io
import re
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# ── App setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="PCAS ML Service",
    description="Placement Capability Analysis System — Machine Learning API",
    version="2.0.0"
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
    if os.path.exists(MODEL_PATH) and os.path.exists(META_PATH):
        pipeline   = joblib.load(MODEL_PATH)
        model_meta = joblib.load(META_PATH)
        print("[OK] PCAS ML model and metadata loaded successfully.")
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


def generate_insights_from_features(feature_dict: dict, prs_score: float) -> List[str]:
    """Generate actionable insights based on dataset means and student metrics."""
    insights = []
    
    # Dataset benchmarks from 10k student placementdata.csv
    benchmarks = {
        "CGPA": 7.7,
        "Internships": 1.0,
        "Projects": 2.0,
        "Workshops/Certifications": 1.0,
        "AptitudeTestScore": 75.0,
        "SoftSkillsRating": 4.0,
        "SSC_Marks": 70.0,
        "HSC_Marks": 75.0,
    }

    if feature_dict.get("CGPA", 0) < benchmarks["CGPA"]:
        insights.append(f"Your CGPA ({feature_dict.get('CGPA', 0)}) is below the competitive benchmark ({benchmarks['CGPA']}). Strengthen semester grades.")
    else:
        insights.append(f"Strong academic foundation with a CGPA of {feature_dict.get('CGPA', 0)}.")

    if feature_dict.get("Internships", 0) < 1:
        insights.append("Practical industry exposure is critical. Prioritize landing at least 1 internship.")
    elif feature_dict.get("Internships", 0) >= 2:
        insights.append("Exceptional internship portfolio gives you a strong edge in interviews.")

    if feature_dict.get("Projects", 0) < benchmarks["Projects"]:
        insights.append("Increase your practical projects to demonstrate applied problem-solving capability.")

    if feature_dict.get("AptitudeTestScore", 0) < benchmarks["AptitudeTestScore"]:
        insights.append("Aptitude scores play a pivotal role in initial screening rounds. Practice quantitative and logical reasoning.")
    else:
        insights.append("Strong aptitude score puts you above the average placement cutoff.")

    if feature_dict.get("SoftSkillsRating", 0) < benchmarks["SoftSkillsRating"]:
        insights.append("Enhance communication and soft skills to excel in group discussions and HR interviews.")

    if not feature_dict.get("PlacementTraining", 0):
        insights.append("Participating in placement training sessions significantly boosts interview readiness.")

    return insights[:4]


def generate_roadmap_tasks(features: dict) -> List[dict]:
    """Generate personalized roadmap based on weak areas."""
    tasks = []

    if features.get("AptitudeTestScore", 80) < 75:
        tasks += [
            {"title": "Practice 20 Quantitative & Logical Aptitude questions daily", "category": "Interview Prep", "priority": "High"},
            {"title": "Take 2 full-length Mock Aptitude Tests weekly", "category": "Interview Prep", "priority": "High"},
        ]

    if features.get("Internships", 1) < 1:
        tasks += [
            {"title": "Apply to 10 verified internship roles on LinkedIn / Internshala", "category": "Internships", "priority": "High"},
            {"title": "Optimize resume with quantifiable project achievements", "category": "Internships", "priority": "Medium"},
        ]

    if features.get("Projects", 2) < 2:
        tasks += [
            {"title": "Build and deploy a full-stack production-grade application", "category": "Projects", "priority": "High"},
            {"title": "Publish project on GitHub with comprehensive README & architecture diagrams", "category": "Projects", "priority": "Medium"},
        ]

    if features.get("SoftSkillsRating", 4.0) < 4.0 or features.get("comm_score", 6) < 6:
        tasks += [
            {"title": "Conduct 2 mock technical and behavioral interviews", "category": "Communication", "priority": "High"},
            {"title": "Master the STAR method for behavioral interview questions", "category": "Communication", "priority": "Medium"},
        ]

    # Universal core prep
    tasks += [
        {"title": "Master Top 50 Data Structures and Algorithms patterns on LeetCode", "category": "Coding Practice", "priority": "High"},
        {"title": "Prepare core fundamentals: DBMS, OS, Computer Networks, and System Design", "category": "Coding Practice", "priority": "Medium"},
    ]

    return tasks


# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class PRSInput(BaseModel):
    # Support both new dataset fields and legacy profile fields gracefully
    cgpa:                      Optional[float] = 7.5
    internshipCount:           Optional[int] = 1
    projectCount:              Optional[int] = 2
    projectLevel:              Optional[int] = 1
    numSkills:                 Optional[int] = 5
    commScore:                 Optional[float] = 6.0
    workshopsCertifications:   Optional[int] = 1
    aptitudeTestScore:         Optional[float] = 75.0
    softSkillsRating:          Optional[float] = 4.0
    extracurricularActivities: Optional[int] = 1
    placementTraining:         Optional[int] = 1
    sscMarks:                  Optional[float] = 75.0
    hscMarks:                  Optional[float] = 75.0


class PRSOutput(BaseModel):
    prsScore:       float
    classification: str
    placementProbability: float
    modelAccuracy:  float
    insights:       List[str]
    featureScores:  dict


class RoadmapInput(BaseModel):
    numSkills:       Optional[int] = 5
    projectCount:    Optional[int] = 2
    projectLevel:    Optional[int] = 1
    internshipCount: Optional[int] = 1
    commScore:       Optional[float] = 6.0
    aptitudeScore:   Optional[float] = 75.0


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "PCAS ML Service",
        "model_loaded": pipeline is not None,
        "model_type": model_meta.get("model_name") if model_meta else None,
        "test_accuracy": model_meta.get("accuracy") if model_meta else None
    }


@app.post("/predict", response_model=PRSOutput)
def predict_prs(data: PRSInput):
    """Predict placement probability and score using the best-performing trained model."""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run model/train.py first.")

    # Convert incoming fields (with robust fallbacks) into model features
    cgpa = float(data.cgpa if data.cgpa is not None else 7.5)
    internships = int(data.internshipCount if data.internshipCount is not None else 0)
    projects = int(data.projectCount if data.projectCount is not None else 1)
    
    # Workshops / Certifications (if not passed directly, infer from numSkills/projectLevel)
    workshops = int(data.workshopsCertifications if data.workshopsCertifications is not None 
                    else min(max(data.numSkills // 3, 0), 3) if data.numSkills else 1)
    
    # Aptitude Test Score (60-90 scale in dataset)
    if data.aptitudeTestScore is not None and data.aptitudeTestScore >= 50:
        aptitude = float(data.aptitudeTestScore)
    else:
        # Map commScore / CGPA approximation to 60-90 range
        aptitude = float(np.clip(60 + (data.commScore or 5) * 3, 60, 90))

    # Soft Skills Rating (3.0 - 5.0 scale)
    if data.softSkillsRating is not None:
        soft_skills = float(np.clip(data.softSkillsRating, 3.0, 5.0))
    else:
        soft_skills = float(np.clip((data.commScore or 5) * 0.45 + 1.0, 3.0, 5.0))

    extra_curr = int(data.extracurricularActivities if data.extracurricularActivities is not None else 1)
    training   = int(data.placementTraining if data.placementTraining is not None else 1)
    ssc_marks  = float(data.sscMarks if data.sscMarks is not None else np.clip(cgpa * 9.5, 60, 95))
    hsc_marks  = float(data.hscMarks if data.hscMarks is not None else np.clip(cgpa * 9.5, 60, 95))

    input_df = pd.DataFrame([{
        'CGPA':                      cgpa,
        'Internships':               internships,
        'Projects':                  projects,
        'Workshops/Certifications':  workshops,
        'AptitudeTestScore':         aptitude,
        'SoftSkillsRating':          soft_skills,
        'ExtracurricularActivities': extra_curr,
        'PlacementTraining':         training,
        'SSC_Marks':                 ssc_marks,
        'HSC_Marks':                 hsc_marks
    }])

    # Predict probability of placement using best model
    probabilities = pipeline.predict_proba(input_df)[0]
    placed_prob = float(probabilities[1])  # probability of PlacementStatus == 1

    # Scale placement probability to PRS score (0 to 100)
    prs_score = round(placed_prob * 100, 1)
    classification = classify_prs(prs_score)

    features_dict = {
        "CGPA":                      cgpa,
        "Internships":               internships,
        "Projects":                  projects,
        "Workshops/Certifications":  workshops,
        "AptitudeTestScore":         aptitude,
        "SoftSkillsRating":          soft_skills,
        "ExtracurricularActivities": extra_curr,
        "PlacementTraining":         training,
        "comm_score":                data.commScore or 6,
    }

    insights = generate_insights_from_features(features_dict, prs_score)

    # Compute breakdown for radar chart
    feature_scores = {
        "academics":     round(np.clip((cgpa / 10.0) * 100, 0, 100), 1),
        "technical":     round(np.clip((aptitude / 90.0) * 100, 0, 100), 1),
        "projects":      round(np.clip((projects / 3.0) * 100, 0, 100), 1),
        "internships":   round(np.clip((internships / 2.0) * 100, 0, 100), 1),
        "communication": round(np.clip((soft_skills / 5.0) * 100, 0, 100), 1),
    }

    return PRSOutput(
        prsScore=prs_score,
        classification=classification,
        placementProbability=round(placed_prob, 4),
        modelAccuracy=round(model_meta.get("accuracy", 0.8085), 4) if model_meta else 0.8085,
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

    emails = re.findall(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}', text)
    phones = re.findall(r'\+?[\d\s\-()]{10,}', text)

    return {
        "skills": sorted(list(set(found_skills))),
        "rawText": text[:2000],
        "email": emails[0] if emails else None,
        "totalSkillsFound": len(found_skills),
    }


@app.post("/generate-roadmap")
def generate_roadmap(data: RoadmapInput):
    """Generate a personalized roadmap based on student's weak areas."""
    features = {
        "num_skills":        data.numSkills,
        "project_count":     data.projectCount,
        "project_level":     data.projectLevel,
        "internship_count":  data.internshipCount,
        "comm_score":        data.commScore,
        "AptitudeTestScore": data.aptitudeScore,
    }
    tasks = generate_roadmap_tasks(features)
    categories = list(set(t["category"] for t in tasks))
    return {
        "tasks": tasks,
        "totalTasks": len(tasks),
        "categories": categories,
    }
