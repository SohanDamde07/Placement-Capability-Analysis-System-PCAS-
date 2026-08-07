const express = require('express');
const protect = require('../middleware/auth');
const Profile = require('../models/Profile');

const router = express.Router();

const RESPONSES = {
  prs: (p) => [
    `Your current PRS score is **${p.prsScore?.toFixed(1) || 'N/A'}** — classified as **${p.classification || 'Unknown'}**.`,
    `To improve your PRS, focus on: ${(p.insights || []).slice(0, 2).join('; ') || 'completing your profile first'}.`,
    `Key areas to strengthen: technical skills (${p.skills?.length || 0} skills listed), internship experience, and communication.`,
  ],
  roadmap: (p) => [
    `Your personalized roadmap is based on your current profile gaps.`,
    p.classification === 'Beginner'
      ? `As a Beginner, start with: core coding practice (LeetCode), build 2 projects, and improve communication.`
      : p.classification === 'Intermediate'
      ? `As Intermediate, focus on: advanced projects, applying for internships, and mock interviews.`
      : `You\'re Placement Ready! Polish your resume, apply widely, and practice system design.`,
    `Navigate to the Roadmap section to track your progress step-by-step.`,
  ],
  skills: (p) => [
    `You currently have **${p.skills?.length || 0}** technical skills listed.`,
    `Top skills in demand: Python, React, Node.js, AWS, Machine Learning, Data Structures.`,
    `Go to Skill Profile to add more skills and update your profile for a better PRS score.`,
  ],
  internship: (p) => [
    `You have listed **${p.internshipCount || 0}** internship(s). The average student has 1–2.`,
    `Apply on: LinkedIn, Internshala, AngelList, and company career pages.`,
    `Tip: Tailor your resume for each application to improve your callback rate by ~40%.`,
  ],
  default: (p) => [
    `Hello! I\'m your PCAS AI Assistant. I can help with:`,
    `• "How to improve PRS?" — Get personalized PRS improvement tips`,
    `• "Suggest roadmap" — Get your learning roadmap`,
    `• "Improve skills" — Get skill recommendations`,
    `• "Internship tips" — Get internship guidance`,
    `Your current status: **${p?.classification || 'Profile incomplete'}** (PRS: ${p?.prsScore?.toFixed(1) || 'N/A'})`,
  ],
};

function getResponse(message, profile) {
  const msg = message.toLowerCase();
  if (msg.includes('prs') || msg.includes('score') || msg.includes('improve') || msg.includes('readiness'))
    return RESPONSES.prs(profile || {});
  if (msg.includes('roadmap') || msg.includes('plan') || msg.includes('path') || msg.includes('next'))
    return RESPONSES.roadmap(profile || {});
  if (msg.includes('skill') || msg.includes('technical') || msg.includes('coding') || msg.includes('language'))
    return RESPONSES.skills(profile || {});
  if (msg.includes('internship') || msg.includes('job') || msg.includes('work') || msg.includes('experience'))
    return RESPONSES.internship(profile || {});
  return RESPONSES.default(profile);
}

// POST /api/assistant/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    const profile = await Profile.findOne({ userId: req.user.id });
    const lines = getResponse(message, profile);
    const responseText = lines.join('\n');

    res.json({
      success:  true,
      message:  message,
      response: responseText,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
