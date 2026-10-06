const express = require('express');
const axios = require('axios');
const protect = require('../middleware/auth');
const { authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const allProfiles = await Profile.find().populate('userId', 'name email branch year createdAt');

    const totalAnalyzed = allProfiles.filter(p => p.prsScore !== null && p.prsScore !== undefined).length;
    
    // PRS Score stats
    const analyzedProfiles = allProfiles.filter(p => p.prsScore !== null && p.prsScore !== undefined);
    const sumPrs = analyzedProfiles.reduce((acc, p) => acc + (p.prsScore || 0), 0);
    const avgPrs = analyzedProfiles.length ? +(sumPrs / analyzedProfiles.length).toFixed(1) : 0;

    let placementReady = 0;
    let intermediate = 0;
    let beginner = 0;

    const branchDist = {};
    const yearDist = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const skillFreq = {};

    analyzedProfiles.forEach(p => {
      const score = p.prsScore;
      if (score >= 70) placementReady++;
      else if (score >= 40) intermediate++;
      else beginner++;

      const branch = p.branch || p.userId?.branch || 'General';
      if (!branchDist[branch]) branchDist[branch] = { count: 0, totalScore: 0 };
      branchDist[branch].count++;
      branchDist[branch].totalScore += score;

      const year = p.year || p.userId?.year || 1;
      if (yearDist[year] !== undefined) yearDist[year]++;

      if (Array.isArray(p.skills)) {
        p.skills.forEach(s => {
          skillFreq[s] = (skillFreq[s] || 0) + 1;
        });
      }
    });

    const branchPerformance = Object.keys(branchDist).map(b => ({
      branch: b,
      studentCount: branchDist[b].count,
      avgScore: +(branchDist[b].totalScore / branchDist[b].count).toFixed(1),
    }));

    const topSkills = Object.entries(skillFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // ML service health
    let mlStatus = { online: false, model: 'N/A', accuracy: 0.8085 };
    try {
      const mlRes = await axios.get(`${ML_URL}/`, { timeout: 3000 });
      mlStatus = {
        online: true,
        model: mlRes.data.model_type || 'Logistic Regression',
        accuracy: mlRes.data.test_accuracy || 0.8085,
      };
    } catch (_) {}

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAnalyzed,
        pendingAnalysis: totalUsers - totalAnalyzed,
        avgPrs,
        placementReady,
        intermediate,
        beginner,
        branchPerformance,
        yearDistribution: yearDist,
        topSkills,
        mlStatus,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/admin/students ───────────────────────────────────────────────────
router.get('/students', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const { branch, year, status, search } = req.query;

    const query = { role: 'student' };
    if (branch && branch !== 'All') query.branch = branch;
    if (year && year !== 'All') query.year = parseInt(year);

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    const userIds = users.map(u => u._id);

    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const list = users.map(u => {
      const p = profileMap.get(u._id.toString()) || {};
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        branch: u.branch || p.branch || 'N/A',
        year: u.year || p.year || 1,
        role: u.role,
        prsScore: p.prsScore !== undefined ? p.prsScore : null,
        classification: p.classification || (p.prsScore != null ? (p.prsScore >= 70 ? 'Placement Ready' : p.prsScore >= 40 ? 'Intermediate' : 'Beginner') : 'Not Analyzed'),
        skills: p.skills || [],
        cgpa: p.cgpa || null,
        projectCount: p.projectCount || 0,
        internshipCount: p.internshipCount || 0,
        featureScores: p.featureScores || {},
        lastAnalyzed: p.lastAnalyzed || null,
        createdAt: u.createdAt,
      };
    });

    const filtered = status && status !== 'All'
      ? list.filter(item => item.classification === status)
      : list;

    res.json({ success: true, count: filtered.length, students: filtered });
  } catch (err) {
    console.error('Admin students fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/admin/export-csv ─────────────────────────────────────────────────
router.get('/export-csv', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const { branch, year, status, search } = req.query;

    const query = { role: 'student' };
    if (branch && branch !== 'All') query.branch = branch;
    if (year   && year   !== 'All') query.year = parseInt(year);
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    const userIds = users.map(u => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    let list = users.map(u => {
      const p = profileMap.get(u._id.toString()) || {};
      return {
        name:            u.name,
        email:           u.email,
        branch:          u.branch || p.branch || 'N/A',
        year:            u.year   || p.year   || 1,
        prsScore:        p.prsScore !== undefined ? p.prsScore : '',
        classification:  p.classification || (p.prsScore != null
                           ? (p.prsScore >= 70 ? 'Placement Ready' : p.prsScore >= 40 ? 'Intermediate' : 'Beginner')
                           : 'Not Analyzed'),
        cgpa:            p.cgpa            || 'N/A',
        internshipCount: p.internshipCount || 0,
        projectCount:    p.projectCount    || 0,
        skills:          (p.skills || []).join('; '),
        createdAt:       u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A',
      };
    });

    if (status && status !== 'All') {
      list = list.filter(s => s.classification === status);
    }

    const headers = [
      'Name', 'Email', 'Branch', 'Year', 'PRS Score',
      'Readiness Tier', 'CGPA', 'Internships', 'Projects', 'Skills', 'Registered Date',
    ];
    const rows = list.map(s => [
      `"${String(s.name).replace(/"/g, '""')}"`,
      `"${String(s.email).replace(/"/g, '""')}"`,
      `"${String(s.branch).replace(/"/g, '""')}"`,
      s.year,
      s.prsScore !== '' ? s.prsScore : 'N/A',
      `"${String(s.classification).replace(/"/g, '""')}"`,
      s.cgpa,
      s.internshipCount,
      s.projectCount,
      `"${String(s.skills).replace(/"/g, '""')}"`,
      s.createdAt,
    ]);

    // UTF-8 BOM so Excel opens correctly
    const BOM = '\uFEFF';
    const csv = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    const filename = `PCAS_Placement_Eligibility_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});



// ── PATCH /api/admin/user/:id/role ────────────────────────────────────────────
router.patch('/user/:id/role', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/admin/user/:id ────────────────────────────────────────────────
router.delete('/user/:id', protect, authorizeRole('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Profile.deleteMany({ userId });
    await Roadmap.deleteMany({ userId });
    await ResumeAnalysis.deleteMany({ userId });
    res.json({ success: true, message: 'Student account and data deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
