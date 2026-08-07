const express = require('express');
const protect = require('../middleware/auth');
const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');

const router = express.Router();

function calculatePRS(data) {
  let score = 0;
  
  // academics (20%): out of 10
  const academicsScore = (Math.min(data.cgpa || 0, 10) / 10) * 100;
  score += academicsScore * 0.20;
  
  // technical (25%): length of skills array (max 10 for full points)
  const numSkills = data.skills ? data.skills.length : 0;
  const technicalScore = (Math.min(numSkills / 10, 1)) * 100;
  score += technicalScore * 0.25;
  
  // projects (25%): projectCount * projectLevel (max 9 for full points)
  const pCount = data.projectCount || 0;
  const pLevel = data.projectLevel || 1;
  const projectsScore = Math.min((pCount * pLevel) / 9, 1) * 100;
  score += projectsScore * 0.25;
  
  // internships (20%): max 2 for full points
  const iCount = data.internshipCount || 0;
  const internshipsScore = (Math.min(iCount / 2, 1)) * 100;
  score += internshipsScore * 0.20;
  
  // communication (10%): out of 10
  const comm = data.commScore || 0;
  const communicationScore = (Math.min(comm / 10, 1)) * 100;
  score += communicationScore * 0.10;
  
  return {
    score: Math.round(score),
    breakdown: {
      academics: Math.round(academicsScore),
      technical: Math.round(technicalScore),
      projects: Math.round(projectsScore),
      internships: Math.round(internshipsScore),
      communication: Math.round(communicationScore)
    }
  };
}

function analyzeSkillGaps(breakdown) {
  let weakAreas = [];
  let insights = [];
  
  if (breakdown.technical < 70) {
    weakAreas.push("technical");
    insights.push("Expand your technical skill set. Add more programming languages and tools.");
  } else {
    insights.push("Strong technical foundation detected.");
  }
  
  if (breakdown.projects < 70) {
    weakAreas.push("projects");
    insights.push("Practical experience is lacking. Build more complex and diverse projects.");
  } else {
    insights.push("Excellent project portfolio showcasing your abilities.");
  }
  
  if (breakdown.internships < 50) {
    weakAreas.push("internships");
    insights.push("Industry experience is limited. Seek internships to gain practical exposure.");
  } else {
    insights.push("Good industry exposure through your internships.");
  }
  
  if (breakdown.communication < 70) {
    weakAreas.push("communication");
    insights.push("Communication skills could be improved. Practice articulation and presentation.");
  } else {
    insights.push("Communication skills are a strong point in your profile.");
  }
  
  if (breakdown.academics < 75) {
    weakAreas.push("academics");
  }
  
  return { weakAreas, insights };
}

function classifyLevel(score) {
  if (score >= 70) return "Placement Ready";
  if (score >= 40) return "Intermediate";
  return "Beginner";
}

function generateRoadmap(weakAreas) {
  let roadmapTasks = [];
  
  if (weakAreas.includes("technical")) {
    roadmapTasks.push({ title: "Master 2 new programming languages or frameworks", category: "Coding Practice", priority: "High" });
    roadmapTasks.push({ title: "Solve 50 LeetCode problems (Medium/Hard)", category: "Coding Practice", priority: "High" });
  }
  if (weakAreas.includes("projects")) {
    roadmapTasks.push({ title: "Build a full-stack application and deploy it", category: "Projects", priority: "High" });
    roadmapTasks.push({ title: "Contribute to an open source project", category: "Projects", priority: "Medium" });
  }
  if (weakAreas.includes("internships")) {
    roadmapTasks.push({ title: "Apply to at least 15 internship roles", category: "Internships", priority: "High" });
    roadmapTasks.push({ title: "Optimize resume for ATS compatibility", category: "Internships", priority: "Medium" });
  }
  if (weakAreas.includes("communication")) {
    roadmapTasks.push({ title: "Participate in 3 mock interviews", category: "Communication", priority: "High" });
    roadmapTasks.push({ title: "Join a developer community and engage in discussions", category: "Communication", priority: "Medium" });
  }
  if (weakAreas.includes("academics")) {
    roadmapTasks.push({ title: "Revise core OS, DBMS, and Networking concepts", category: "Interview Prep", priority: "High" });
  }
  
  // Base tasks if no severe weak areas
  if (roadmapTasks.length === 0) {
      roadmapTasks.push({ title: "Refine system design knowledge", category: "Interview Prep", priority: "Medium" });
      roadmapTasks.push({ title: "Start applying for full-time roles", category: "Internships", priority: "High" });
  }
  
  return roadmapTasks;
}

router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
    
    // Process data natively
    const { score, breakdown } = calculatePRS(data);
    const { weakAreas, insights } = analyzeSkillGaps(breakdown);
    const level = classifyLevel(score);
    const roadmapTasks = generateRoadmap(weakAreas);
    
    // Save to Profile DB so Dashboard & PRSAnalysis can dynamically read it
    const profileUpdate = {
      ...data,
      prsScore: score,
      classification: level,
      insights: insights,
      featureScores: breakdown,
      lastAnalyzed: new Date(),
    };

    await Profile.findOneAndUpdate(
      { userId: req.user.id },
      profileUpdate,
      { new: true, upsert: true, runValidators: true }
    );
    
    // Format tasks for DB saving
    const existingRoadmap = await Roadmap.findOne({ userId: req.user.id });
    const completedTitles = new Set(
      (existingRoadmap?.tasks || []).filter(t => t.status === 'completed').map(t => t.title)
    );

    const enrichedTasks = roadmapTasks.map(t => ({
      ...t,
      status: completedTitles.has(t.title) ? 'completed' : 'pending',
    }));

    // Update Roadmap in DB
    const roadmapDoc = await Roadmap.findOneAndUpdate(
      { userId: req.user.id },
      { tasks: enrichedTasks, generatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    const completed = roadmapDoc.tasks.filter(t => t.status === 'completed').length;
    roadmapDoc.overallProgress = Math.round((completed / roadmapDoc.tasks.length) * 100) || 0;
    await roadmapDoc.save();

    // Respond exactly as requested
    res.json({
      prsScore: score,
      level: level,
      weakAreas: weakAreas,
      insights: insights,
      roadmap: roadmapTasks
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.calculatePRS = calculatePRS;
module.exports.analyzeSkillGaps = analyzeSkillGaps;
module.exports.classifyLevel = classifyLevel;
module.exports.generateRoadmap = generateRoadmap;
