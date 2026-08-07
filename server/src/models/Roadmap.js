const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  category: { type: String, required: true }, // Coding Practice, Communication, Internships, Projects, Interview Prep
  status:   { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
});

const roadmapSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tasks:           { type: [taskSchema], default: [] },
    overallProgress: { type: Number, default: 0 }, // percentage 0–100
    currentStreak:   { type: Number, default: 0 }, // days
    generatedAt:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
