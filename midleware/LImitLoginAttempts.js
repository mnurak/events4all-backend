const LoginAttempt = require("../Schemas/LoginAttempts");

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MINUTES = 60;

module.exports = async function limitLoginAttempts(req, res, next) {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const attempt = await LoginAttempt.findOne({ ip: ipAddress });

  const now = new Date();

  if (attempt) {
    const minutesPassed = (now - attempt.lastAttempt) / 1000 / 60;

    if (minutesPassed > BLOCK_TIME_MINUTES) {
      // Reset if block time passed
      attempt.count = 1;
      attempt.lastAttempt = now;
      await attempt.save();
    } else if (attempt.count >= MAX_ATTEMPTS) {
      const waitTime = Math.ceil(BLOCK_TIME_MINUTES - minutesPassed);
      return res.status(429).json({
        success: false,
        error: `Too many failed login attempts. Please try again after ${waitTime} minutes.`,
      });
    } else {
      attempt.count += 1;
      attempt.lastAttempt = now;
      await attempt.save();
    }
  } else {
    await LoginAttempt.create({ ip: ipAddress, count: 1, lastAttempt: now });
  }
  next();
};
