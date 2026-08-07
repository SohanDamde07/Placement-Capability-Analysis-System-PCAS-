const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Personal details (may duplicate user fields for convenience)
    name:   { type: String },
    email:  { type: String },
    branch: { type: String, default: '' },
    year:   { type: Number, default: 1 },
    // Skill data
    skills:           { type: [String], default: [] },
    projectCount:     { type: Number, default: 0 },
    projectLevel:     { type: Number, default: 1, min: 1, max: 3 }, // 1=Beginner 2=Intermediate 3=Advanced
    internshipCount:  { type: Number, default: 0 },
    internshipDetails:{ type: String, default: '' },
    commScore:        { type: Number, default: 5, min: 1, max: 10 },
    cgpa:             { type: Number, default: 7.0 },
    // Resume
    resumePath:       { type: String, default: '' },
    resumeFilename:   { type: String, default: '' },
    // ML Results
    prsScore:         { type: Number, default: null },
    classification:   { type: String, default: '' },
    insights:         { type: [String], default: [] },
    featureScores:    { type: Object, default: {} },
    lastAnalyzed:     { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
