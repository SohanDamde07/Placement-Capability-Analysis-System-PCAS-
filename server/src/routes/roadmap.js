const express = require('express');
const axios   = require('axios');
const protect = require('../middleware/auth');
const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// GET /api/roadmap
router.get('/', protect, async (req, res) => {
  try {
    let roadmap = await Roadmap.findOne({ userId: req.user.id });
    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/roadmap/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Complete your profile first' });

    const payload = {
      numSkills:       profile.skills?.length || 0,
      projectCount:    profile.projectCount   || 0,
      projectLevel:    profile.projectLevel   || 1,
      internshipCount: profile.internshipCount|| 0,
      commScore:       profile.commScore       || 5,
    };

    let tasks = [];
    try {
      const resp = await axios.post(`${ML_URL}/generate-roadmap`, payload, { timeout: 10000 });
      tasks = resp.data.tasks || [];
    } catch (mlErr) {
      console.warn('ML roadmap generation failed, using fallback:', mlErr.message);
      // Fallback static tasks
      tasks = [
        { title: 'Complete 5 LeetCode Medium problems', category: 'Coding Practice', priority: 'High' },
        { title: 'Build a full-stack project', category: 'Projects', priority: 'High' },
        { title: 'Apply to 5 internships', category: 'Internships', priority: 'High' },
        { title: 'Record a mock interview', category: 'Communication', priority: 'Medium' },
        { title: 'Prepare for system design interviews', category: 'Interview Prep', priority: 'Medium' },
      ];
    }

    // Preserve completion status of existing tasks with same title
    const existing = await Roadmap.findOne({ userId: req.user.id });
    const completedTitles = new Set(
      (existing?.tasks || []).filter(t => t.status === 'completed').map(t => t.title)
    );

    const enrichedTasks = tasks.map(t => ({
      ...t,
      status: completedTitles.has(t.title) ? 'completed' : 'pending',
    }));

    const roadmap = await Roadmap.findOneAndUpdate(
      { userId: req.user.id },
      { tasks: enrichedTasks, generatedAt: new Date() },
      { new: true, upsert: true }
    );

    // Recalculate progress
    const completed = roadmap.tasks.filter(t => t.status === 'completed').length;
    roadmap.overallProgress = Math.round((completed / roadmap.tasks.length) * 100) || 0;
    await roadmap.save();

    res.json({ success: true, roadmap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/roadmap/task/:taskId — toggle task status
router.patch('/task/:taskId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.user.id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const task = roadmap.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = status || (task.status === 'completed' ? 'pending' : 'completed');

    // Recalculate overall progress
    const completed = roadmap.tasks.filter(t => t.status === 'completed').length;
    roadmap.overallProgress = Math.round((completed / roadmap.tasks.length) * 100);

    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
