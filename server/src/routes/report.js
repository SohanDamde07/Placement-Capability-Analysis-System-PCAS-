const express = require('express');
const PDFDocument = require('pdfkit');
const protect = require('../middleware/auth');
const Profile = require('../models/Profile');
const Roadmap = require('../models/Roadmap');
const User    = require('../models/User');

const router = express.Router();

// GET /api/report/download
router.get('/download', protect, async (req, res) => {
  try {
    const user    = await User.findById(req.user.id);
    const profile = await Profile.findOne({ userId: req.user.id });
    const roadmap = await Roadmap.findOne({ userId: req.user.id });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="PCAS_Report_${user.name.replace(/\s+/g, '_')}.pdf"`);
    doc.pipe(res);

    // ── Header ─────────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 100).fill('#3525cd');
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(28)
       .text('PCAS Intelligence Report', 50, 30);
    doc.fontSize(12)
       .font('Helvetica')
       .text('Placement Capability Analysis System', 50, 65);

    doc.moveDown(3);

    // ── Student Info ────────────────────────────────────────────────────────────
    doc.fillColor('#0b1c30').font('Helvetica-Bold').fontSize(16).text('Student Profile');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5eeff').lineWidth(1).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(12).fillColor('#464555');
    doc.text(`Name:   ${user.name}`);
    doc.text(`Email:  ${user.email}`);
    doc.text(`Branch: ${profile?.branch || 'N/A'}   |   Year: ${profile?.year || 'N/A'}`);
    doc.text(`Generated: ${new Date().toDateString()}`);

    doc.moveDown(2);

    // ── PRS Score ───────────────────────────────────────────────────────────────
    doc.fillColor('#0b1c30').font('Helvetica-Bold').fontSize(16).text('Placement Readiness Score (PRS)');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5eeff').lineWidth(1).stroke();
    doc.moveDown(0.5);

    const prs = profile?.prsScore != null ? profile.prsScore.toFixed(1) : 'N/A';
    const cls = profile?.classification || 'N/A';

    doc.fontSize(40).font('Helvetica-Bold').fillColor('#3525cd').text(`${prs}`, { align: 'center' });
    doc.fontSize(14).fillColor('#464555').text(`Classification: ${cls}`, { align: 'center' });

    doc.moveDown(2);

    // ── Skill Breakdown ─────────────────────────────────────────────────────────
    if (profile?.featureScores && Object.keys(profile.featureScores).length) {
      doc.fillColor('#0b1c30').font('Helvetica-Bold').fontSize(16).text('Skill Breakdown');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5eeff').lineWidth(1).stroke();
      doc.moveDown(0.5);

      Object.entries(profile.featureScores).forEach(([key, val]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const score = Math.round(val);
        doc.font('Helvetica').fontSize(12).fillColor('#464555').text(`${label}: ${score}/100`);
        // Draw bar
        const barW = Math.round((score / 100) * 300);
        doc.rect(doc.x, doc.y, 300, 8).fill('#e5eeff');
        doc.rect(doc.x, doc.y, barW, 8).fill('#3525cd');
        doc.moveDown(0.8);
      });
    }

    doc.moveDown(1);

    // ── Insights ────────────────────────────────────────────────────────────────
    if (profile?.insights?.length) {
      doc.fillColor('#0b1c30').font('Helvetica-Bold').fontSize(16).text('AI Insights');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5eeff').lineWidth(1).stroke();
      doc.moveDown(0.5);
      profile.insights.forEach((ins, i) => {
        doc.font('Helvetica').fontSize(12).fillColor('#464555').text(`${i + 1}. ${ins}`);
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(1);

    // ── Roadmap Tasks ───────────────────────────────────────────────────────────
    if (roadmap?.tasks?.length) {
      doc.fillColor('#0b1c30').font('Helvetica-Bold').fontSize(16).text('Personalized Roadmap');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5eeff').lineWidth(1).stroke();
      doc.moveDown(0.5);

      const cats = [...new Set(roadmap.tasks.map(t => t.category))];
      cats.forEach(cat => {
        doc.font('Helvetica-Bold').fontSize(13).fillColor('#3525cd').text(cat);
        const tasks = roadmap.tasks.filter(t => t.category === cat);
        tasks.forEach(t => {
          const done = t.status === 'completed' ? '✓' : '○';
          doc.font('Helvetica').fontSize(11).fillColor('#464555').text(`  ${done} ${t.title}`);
        });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#006e2f')
         .text(`Overall Progress: ${roadmap.overallProgress}%`);
    }

    // ── Footer ──────────────────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.fontSize(9).fillColor('#777587')
       .text('Generated by PCAS — Placement Capability Analysis System', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
