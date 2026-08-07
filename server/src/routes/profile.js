const express = require('express');
const multer  = require('multer');
const path    = require('path');
const axios   = require('axios');
const fs      = require('fs');
const protect = require('../middleware/auth');
const Profile = require('../models/Profile');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Roadmap = require('../models/Roadmap');
const { calculatePRS, analyzeSkillGaps, classifyLevel, generateRoadmap } = require('./analyze');

const router  = express.Router();
const ML_URL  = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// ── Multer setup ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, TXT allowed'));
  },
});

// ── Helper: call ML predict ───────────────────────────────────────────────────
async function callMLPredict(profileData) {
  const payload = {
    numSkills:       profileData.skills?.length || 0,
    projectCount:    profileData.projectCount   || 0,
    projectLevel:    profileData.projectLevel   || 1,
    internshipCount: profileData.internshipCount|| 0,
    commScore:       profileData.commScore       || 5,
    cgpa:            profileData.cgpa            || 7.0,
  };
  const response = await axios.post(`${ML_URL}/predict`, payload, { timeout: 10000 });
  return response.data;
}

// ── Helper: extract text from uploaded file ───────────────────────────────────
async function extractTextFromFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return (data.text || '').trim();
  }

  if (ext === '.docx' || ext === '.doc') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return (result.value || '').trim();
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8').trim();
  }

  return '';
}

// ── AI Analysis prompt ────────────────────────────────────────────────────────
const AI_PROMPT = `Analyze the following student resume and return structured data in JSON format:

- skills (array of technologies/tools/languages mentioned)
- projectCount (number of projects mentioned)
- internshipExperience (true/false)
- suggestedRole (Frontend / Backend / Data / Other)
- strengths (array of 3-5 specific strengths found)
- weaknesses (array of 3-5 areas for improvement)

Return ONLY valid JSON, no other text.`;

// ── Helper: analyze with OpenAI — text mode ───────────────────────────────────
async function analyzeResumeTextWithAI(resumeText) {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    try {
      console.log(`[AI-Text] Trying OpenAI model: gpt-4o-mini`);
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: AI_PROMPT },
          { role: 'user', content: `Resume:\n${resumeText}` }
        ]
      });
      console.log(`[AI-Text] Success with OpenAI gpt-4o-mini`);
      return response.choices[0].message.content;
    } catch (err) {
      console.warn(`[AI-Text] OpenAI failed:`, err.message.substring(0, 100));
    }
  }

  return null;
}


// ── Helper: parse AI JSON response ────────────────────────────────────────────
function parseAIResponse(rawText) {
  if (!rawText) return null;

  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      skills:                Array.isArray(parsed.skills) ? parsed.skills : [],
      projectCount:          typeof parsed.projectCount === 'number' ? parsed.projectCount : 0,
      internshipExperience:  !!parsed.internshipExperience,
      suggestedRole:         parsed.suggestedRole || 'Other',
      strengths:             Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses:            Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    };
  } catch (err) {
    console.error('Failed to parse AI response:', err.message);
    console.error('Raw:', rawText.substring(0, 200));
    return null;
  }
}

// ── Helper: local fallback skill extraction (when AI is unavailable) ──────────
function extractSkillsLocally(text) {
  const knownSkills = [
    'Python','JavaScript','TypeScript','Java','C++','C#','C','Go','Rust','Ruby','PHP','Swift','Kotlin','Dart','R','Scala',
    'React','Angular','Vue','Vue.js','Next.js','Svelte','jQuery','Bootstrap','Tailwind','TailwindCSS',
    'Node.js','Express','Django','Flask','FastAPI','Spring','Spring Boot','Laravel','Rails','ASP.NET',
    'MongoDB','MySQL','PostgreSQL','Redis','Firebase','Supabase','SQLite','Oracle','DynamoDB','Cassandra',
    'AWS','Azure','GCP','Google Cloud','Docker','Kubernetes','Jenkins','CI/CD','Terraform','Ansible',
    'Git','GitHub','GitLab','Linux','Bash',
    'Machine Learning','Deep Learning','NLP','Computer Vision','TensorFlow','PyTorch','Keras','Scikit-learn','Pandas','NumPy',
    'HTML','CSS','SASS','REST','GraphQL','WebSocket',
    'Flutter','React Native','Android','iOS',
    'Figma','Adobe XD','Photoshop',
    'Agile','Scrum','JIRA',
    'Data Structures','Algorithms','OOP','System Design','Microservices',
    'Blockchain','Solidity','Web3',
    'Power BI','Tableau','Excel','MATLAB','OpenCV','Selenium','Postman',
    'Natural Language Processing','Artificial Intelligence','Data Science','Data Analytics',
    'NoSQL','SQL Server','API','DevOps','Heroku','Netlify','Vercel',
  ];

  const found = [];
  for (const skill of knownSkills) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) found.push(skill);
  }

  const projectMatches = text.match(/project/gi) || [];
  const projectCount = Math.min(Math.max(Math.floor(projectMatches.length / 2), 0), 10);
  const hasInternship = /intern(ship)?/i.test(text);

  let suggestedRole = 'Other';
  const fe = ['React','Angular','Vue','HTML','CSS','Tailwind','Figma','Flutter'];
  const be = ['Node.js','Express','Django','Flask','Spring','FastAPI','MongoDB','PostgreSQL','MySQL'];
  const da = ['Machine Learning','Deep Learning','TensorFlow','PyTorch','Pandas','NumPy','R','Data Science'];
  const feC = found.filter(s => fe.includes(s)).length;
  const beC = found.filter(s => be.includes(s)).length;
  const daC = found.filter(s => da.includes(s)).length;
  if (daC >= feC && daC >= beC && daC > 0) suggestedRole = 'Data';
  else if (beC >= feC && beC > 0) suggestedRole = 'Backend';
  else if (feC > 0) suggestedRole = 'Frontend';

  const strengths = [];
  const weaknesses = [];
  if (found.length >= 5) strengths.push('Diverse technical skill set');
  if (found.length >= 8) strengths.push('Strong breadth across multiple technologies');
  if (hasInternship) strengths.push('Has industry/internship experience');
  if (projectCount >= 3) strengths.push('Good project portfolio');
  if (found.length < 3) weaknesses.push('Limited technical skills listed on resume');
  if (!hasInternship) weaknesses.push('No internship experience detected');
  if (projectCount < 2) weaknesses.push('Needs more project experience');

  return { skills: found, projectCount, internshipExperience: hasInternship, suggestedRole, strengths, weaknesses };
}

// ── Helper: generate roadmap tasks from AI weaknesses ─────────────────────────
function generateRoadmapFromWeaknesses(weaknesses) {
  const tasks = [];
  for (const weakness of weaknesses) {
    const w = weakness.toLowerCase();
    if (w.includes('project') || w.includes('portfolio') || w.includes('practical')) {
      tasks.push({ title: `Build a project to address: ${weakness}`, category: 'Projects', priority: 'High' });
    } else if (w.includes('intern') || w.includes('experience') || w.includes('industry')) {
      tasks.push({ title: `Gain experience: ${weakness}`, category: 'Internships', priority: 'High' });
    } else if (w.includes('communicat') || w.includes('present') || w.includes('soft skill')) {
      tasks.push({ title: `Improve: ${weakness}`, category: 'Communication', priority: 'Medium' });
    } else if (w.includes('interview') || w.includes('dsa') || w.includes('algorithm') || w.includes('data structure')) {
      tasks.push({ title: `Practice: ${weakness}`, category: 'Interview Prep', priority: 'High' });
    } else if (w.includes('skill') || w.includes('technolog') || w.includes('language') || w.includes('framework') || w.includes('coding')) {
      tasks.push({ title: `Learn/improve: ${weakness}`, category: 'Coding Practice', priority: 'High' });
    } else {
      tasks.push({ title: `Address: ${weakness}`, category: 'Coding Practice', priority: 'Medium' });
    }
  }
  if (tasks.length === 0) tasks.push({ title: 'Continue refining your skills and applying for roles', category: 'Interview Prep', priority: 'Medium' });
  return tasks;
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/profile
router.get('/', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile (create/update)
router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user.id };
    let mlResult = { prsScore: null, classification: '', insights: [], featureScores: {} };
    try { mlResult = await callMLPredict(data); } catch (mlErr) {
      console.warn('ML service unavailable:', mlErr.message);
    }
    const update = { ...data, prsScore: mlResult.prsScore, classification: mlResult.classification, insights: mlResult.insights, featureScores: mlResult.featureScores, lastAnalyzed: new Date() };
    const profile = await Profile.findOneAndUpdate({ userId: req.user.id }, update, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, profile, mlResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/resume — upload resume, analyze, auto-update everything
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ── Step 1: Try text extraction ───────────────────────────────────────
    let extractedText = '';
    try {
      extractedText = await extractTextFromFile(req.file.path, req.file.originalname);
      console.log(`[Resume] Extracted ${extractedText.length} chars from ${req.file.originalname}`);
    } catch (extractErr) {
      console.error('[Resume] Text extraction error:', extractErr.message);
    }

    // ── Step 2: Get AI analysis ──────────────────────────────────────────
    let rawAIResponse = null;
    let aiResult = null;

    if (extractedText.length >= 50) {
      // Good text — send text to AI
      try {
        rawAIResponse = await analyzeResumeTextWithAI(extractedText);
        aiResult = parseAIResponse(rawAIResponse);
      } catch (e) { console.warn('[Resume] Text AI failed:', e.message); }
    }

    // (Gemini multimodal fallback has been removed per user request)

    // ── Step 3: Local fallback if AI unavailable ─────────────────────────
    if (!aiResult && extractedText.length >= 20) {
      console.log('[Resume] AI unavailable — using local skill extraction');
      aiResult = extractSkillsLocally(extractedText);
    }

    // ── Step 4: If nothing worked at all ─────────────────────────────────
    if (!aiResult) {
      await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { resumePath: req.file.path, resumeFilename: req.file.originalname },
        { upsert: true }
      );
      return res.json({
        success: true,
        message: 'Resume uploaded but could not analyze. Your PDF appears to be image-based/scanned. The OpenAI service requires text-based PDFs or DOCX files. Please upload a different file or enter your data manually.',
        filename: req.file.originalname,
        extractedSkills: [],
        totalFound: 0,
        aiAnalysis: null,
      });
    }

    // ── Step 5: Merge with existing profile ──────────────────────────────
    const currentProfile = await Profile.findOne({ userId: req.user.id }) || {};
    const mergedSkills = [...new Set([...(currentProfile.skills || []), ...(aiResult.skills || [])])];
    const updatedProjectCount = Math.max(currentProfile.projectCount || 0, aiResult.projectCount || 0);
    const updatedInternshipCount = aiResult.internshipExperience
      ? Math.max(currentProfile.internshipCount || 0, 1)
      : (currentProfile.internshipCount || 0);

    // ── Step 6: Calculate PRS ────────────────────────────────────────────
    const profileForPRS = {
      skills: mergedSkills,
      projectCount: updatedProjectCount,
      projectLevel: currentProfile.projectLevel || 1,
      internshipCount: updatedInternshipCount,
      commScore: currentProfile.commScore || 5,
      cgpa: currentProfile.cgpa || 7.0,
    };
    const { score: prsScore, breakdown } = calculatePRS(profileForPRS);
    const { weakAreas, insights } = analyzeSkillGaps(breakdown);
    const classification = classifyLevel(prsScore);

    // ── Step 7: Save Profile ─────────────────────────────────────────────
    await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        resumePath: req.file.path, resumeFilename: req.file.originalname,
        skills: mergedSkills, projectCount: updatedProjectCount, internshipCount: updatedInternshipCount,
        prsScore, classification, insights, featureScores: breakdown, lastAnalyzed: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    // ── Step 8: Save ResumeAnalysis ──────────────────────────────────────
    await ResumeAnalysis.findOneAndUpdate(
      { userId: req.user.id },
      {
        resumeFilename: req.file.originalname,
        skills: aiResult.skills, projectCount: aiResult.projectCount,
        internshipExperience: aiResult.internshipExperience, suggestedRole: aiResult.suggestedRole,
        strengths: aiResult.strengths, weaknesses: aiResult.weaknesses,
        rawResponse: rawAIResponse || 'local-fallback', analyzedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // ── Step 9: Generate Roadmap ─────────────────────────────────────────
    let roadmapTasks = aiResult.weaknesses?.length > 0 ? generateRoadmapFromWeaknesses(aiResult.weaknesses) : [];
    const prsRoadmapTasks = generateRoadmap(weakAreas);
    const allTasks = [...roadmapTasks, ...prsRoadmapTasks];
    const uniqueTasks = allTasks.filter((t, i, self) => i === self.findIndex(x => x.title === t.title));

    const existingRoadmap = await Roadmap.findOne({ userId: req.user.id });
    const completedTitles = new Set((existingRoadmap?.tasks || []).filter(t => t.status === 'completed').map(t => t.title));
    const enrichedTasks = uniqueTasks.map(t => ({ ...t, status: completedTitles.has(t.title) ? 'completed' : 'pending' }));

    const roadmapDoc = await Roadmap.findOneAndUpdate(
      { userId: req.user.id },
      { tasks: enrichedTasks, generatedAt: new Date() },
      { new: true, upsert: true }
    );
    const completed = roadmapDoc.tasks.filter(t => t.status === 'completed').length;
    roadmapDoc.overallProgress = roadmapDoc.tasks.length > 0 ? Math.round((completed / roadmapDoc.tasks.length) * 100) : 0;
    await roadmapDoc.save();

    // ── Step 10: Respond ─────────────────────────────────────────────────
    console.log(`[Resume] Analysis complete: ${aiResult.skills.length} skills, PRS=${prsScore}, role=${aiResult.suggestedRole}`);
    res.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      filename: req.file.originalname,
      extractedSkills: aiResult.skills,
      totalFound: aiResult.skills.length,
      aiAnalysis: {
        skills: aiResult.skills, projectCount: aiResult.projectCount,
        internshipExperience: aiResult.internshipExperience, suggestedRole: aiResult.suggestedRole,
        strengths: aiResult.strengths, weaknesses: aiResult.weaknesses,
      },
      prsScore, classification, roadmapGenerated: enrichedTasks.length > 0,
    });
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/profile/resume-analysis
router.get('/resume-analysis', protect, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ userId: req.user.id });
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
