const mongoose = require('mongoose');

const LoginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
  blockedUntil: { type: Date, default: null }
});

const LoginAttempts = mongoose.model("LoginAttempt", LoginAttemptSchema);
module.exports = LoginAttempts;