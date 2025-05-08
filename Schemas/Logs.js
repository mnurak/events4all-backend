const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  name: { type: String, required: true },
  operation: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  changeDetails: { type: Object, required: true },
});

const Logs = mongoose.model("logs", logSchema);

module.exports = Logs;
