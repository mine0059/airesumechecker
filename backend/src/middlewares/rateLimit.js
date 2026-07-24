const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req, res) => req.user?._id?.toString() || ipKeyGenerator(req, res),
  message: {
    error: { message: "Too many analyses - please wait a minues and retry." },
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req, res) => ipKeyGenerator(req, res),
  message: {
    error: { message: 'Too many auth attemps = please wait and retry' },
  },
});

module.exports = { analyzeLimiter, authLimiter };
