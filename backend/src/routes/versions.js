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
    const resumeIds = resume.map((r) => r._id);           // fix: resumes → resume
    const resumeMap = new Map(resume.map((r) => [r._id.toString(), r])); // fix: resumes → resume

    const versions = await ResumeVersion.find({ resumeId: { $in: resumeIds } })
      // fix: removed stray comma after "resumeId" in select string
      .select('_id resumeId label versionNumber sourceType createdAt latestAnalysisId parentVersionId')
      .sort({ createdAt: -1 })
      .lean();

    const analysisIds = versions.map((v) => v.latestAnalysisId).filter(Boolean);
    const analyses = analysisIds.length
      ? await Analysis.find({ _id: { $in: analysisIds } })
          .select('_id atsScore versionId')
          .lean()
      : [];
    const scoreByVersion = new Map(
      analyses.map((a) => [a.versionId.toString(), a.atsScore])
    );

    const items = versions.map((v) => {
      const rEntry = resumeMap.get(v.resumeId.toString());
      return {
        id: v._id,
        label: v.label,
        versionNumber: v.versionNumber,
        sourceType: v.sourceType, // fix: v.createdAt → v.sourceType
        createdAt: v.createdAt,
        score: scoreByVersion.get(v._id.toString()) ?? null,
        resumeId: v.resumeId,
        resumeTitle: rEntry?.title || 'Resume',
        parentVersionId: v.parentVersionId,
      };
    });

    const totals = {
      all: items.length,
      uploads: items.filter((i) => i.sourceType === 'upload').length,
      rewrites: items.filter((i) => i.sourceType === 'rewrite').length,
    };

    res.json({ versions: items, totals });
  }),
);

module.exports = router;
