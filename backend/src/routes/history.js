const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/auth');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const Analysis = require('../models/Analysis');

const router = express.Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const resume = await Resume.find({ userId }).lean();
    const resumeIds = resume.map((r) => r._id);                              // fix: resumes → resume
    const resumeMap = new Map(resume.map((r) => [r._id.toString(), r]));     // fix: resumes → resume

    const versions = await ResumeVersion.find({ resumeId: { $in: resumeIds } })
      // fix: removed stray comma after "resumeId" in select string
      .select('_id resumeId label versionNumber sourceType createdAt latestAnalysisId parentVersionId')
      .sort({ createdAt: -1 })
      .lean();

    // fix: analyses was used but never fetched — added query
    const analyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const events = []; // fix: was `const event = []` but body used `events` everywhere

    for (const r of resume) { // fix: resumes → resume
      events.push({
        id: `r-${r._id}`,
        type: 'upload',
        title: `${r.title} uploaded`,
        subtitle: 'Parsed and version V1 created',
        label: 'V1',
        at: r.createdAt,
        resumeId: r._id,
        resumeTitle: r.title,
      });
    }

    for (const v of versions) {
      if (v.sourceType !== 'rewrite') continue; // fix: "rewrites" → "rewrite"
      const rEntry = resumeMap.get(v.resumeId.toString());
      events.push({
        id: `v-${v._id}`, // fix: r._id → v._id
        type: 'rewrite',
        title: `${v.label} created for ${rEntry?.title || 'resume'}`,
        subtitle: 'Rewrite applied to previous version',
        label: `${v.label} created`,
        at: v.createdAt,
        resumeId: v.resumeId,
        resumeTitle: rEntry?.title || 'Resume',
      });
    }

    for (const a of analyses) {
      const rEntry = resumeMap.get(a.resumeId.toString());
      events.push({
        id: `a-${a._id}`,
        type: 'analyze',
        title: `Analysis complete on ${rEntry?.title || 'resume'}`,
        subtitle: `ATS score ${a.atsScore} / 100`, // fix: was showing resume title instead of score
        label: `${a.atsScore}`,
        at: a.createdAt,
        resumeId: a.resumeId,
        resumeTitle: rEntry?.title || 'Resume',
      });
    }

    events.sort((a, b) => new Date(b.at) - new Date(a.at)); // fix: event → events

    const totals = {
      all: events.length,
      upload: events.filter((e) => e.type === 'upload').length,
      analyze: events.filter((e) => e.type === 'analyze').length,
      rewrite: events.filter((e) => e.type === 'rewrite').length,
    };

    res.json({ events, totals });
  }),
);

module.exports = router;
