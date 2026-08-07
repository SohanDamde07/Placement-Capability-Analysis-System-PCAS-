const express = require('express');
const protect = require('../middleware/auth');
const Profile = require('../models/Profile');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const router = express.Router();

// Average benchmark values (used for comparison)
const BENCHMARKS = {
  technical:     65,
  projects:      60,
  internships:   50,
  communication: 65,
  academics:     70,
};
const TARGET = {
  technical:     85,
  projects:      80,
  internships:   75,
  communication: 80,
  academics:     85,
};

// GET /api/analysis
router.get('/', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile || profile.prsScore === null) {
      return res.json({
        success: true,
        message: 'No analysis data yet. Please complete your Skill Profile.',
        analyzed: false,
      });
    }

    const featureScores = profile.featureScores || {};
    const userScores = {
      technical:     featureScores.technical     || 0,
      projects:      featureScores.projects      || 0,
      internships:   featureScores.internships   || 0,
      communication: featureScores.communication || 0,
      academics:     featureScores.academics     || 0,
    };

    // Identify strongest and weakest areas
    const entries = Object.entries(userScores);
    const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    const weakest   = entries.reduce((a, b) => (b[1] < a[1] ? b : a));

    const breakdown = entries.map(([key, val]) => ({
      parameter:  key.charAt(0).toUpperCase() + key.slice(1),
      yourScore:  Math.round(val),
      avgMarket:  BENCHMARKS[key],
      targetPath: TARGET[key],
      trend:      val > BENCHMARKS[key] ? 'up' : 'down',
      delta:      Math.round(val - BENCHMARKS[key]),
    }));

    // Fetch AI resume analysis for strengths/weaknesses
    let aiStrengths = [];
    let aiWeaknesses = [];
    let suggestedRole = '';
    try {
      const resumeAnalysis = await ResumeAnalysis.findOne({ userId: req.user.id });
      if (resumeAnalysis) {
        aiStrengths = resumeAnalysis.strengths || [];
        aiWeaknesses = resumeAnalysis.weaknesses || [];
        suggestedRole = resumeAnalysis.suggestedRole || '';
      }
    } catch (raErr) {
      console.warn('Could not fetch resume analysis:', raErr.message);
    }

    res.json({
      success:        true,
      analyzed:       true,
      prsScore:       profile.prsScore,
      classification: profile.classification,
      insights:       profile.insights,
      userScores,
      avgScores:      BENCHMARKS,
      targetScores:   TARGET,
      breakdown,
      strongest:      strongest[0],
      weakest:        weakest[0],
      lastAnalyzed:   profile.lastAnalyzed,
      // AI resume analysis data
      aiStrengths,
      aiWeaknesses,
      suggestedRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
