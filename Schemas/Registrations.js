const mongoose = require("mongoose");

const participants = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    usn: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const registrationSchema = mongoose.Schema({
  team_name: {
    type: String,
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true,
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "events",
    required: true,
  },
  participants: [participants],
  registration_date: {
    type: Date,
    default: Date.now,
  },
  verification: {
    type: String,
    enum: ["awaiting", "verified", "rejected"],
    default: "awaiting",
  },
});

registrationSchema.index({ student_id: 1, event_id: 1 }, { unique: true });
registrationSchema.index({ team_name: 1, event_id: 1 }, { unique: true });

const Registrations = mongoose.model("registrations", registrationSchema);
module.exports = Registrations;
