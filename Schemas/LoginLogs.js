const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  type: { type: String, required: true },
  id: { type: String },
  email: {
    type: String,
    required: true,
  },
  ipAddress: { type: String, required: true },
  userAgent: {type:String, required:true},
  message: { type: String },
  status: { type: String, enum: ["failure", "success"], default: "failure" },
  timestamp: { type: Date, default: Date.now },
});

const LoginLogs = mongoose.model("loginlogs", loginSchema);

module.exports = LoginLogs;
