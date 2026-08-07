const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    resumeFilename: { type: String, default: '' },
    // AI-extracted structured data
    skills:                { type: [String], default: [] },
    projectCount:          { type: Number, default: 0 },
    internshipExperience:  { type: Boolean, default: false },
    suggestedRole:         { type: String, default: '' },
    strengths:             { type: [String], default: [] },
    weaknesses:            { type: [String], default: [] },
    // Raw AI response for debugging
    rawResponse:           { type: String, default: '' },
    analyzedAt:            { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
