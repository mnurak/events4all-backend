const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  registrationEndDate :{
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v < this.date;
      },
      message: 'Registration end date should be before the event date.',
    },
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  collegeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
  },
  maxParticipantsPerTeam:{
    type: Number,
    default: 1
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', "closed", "awaiting"],
    default: 'active',
  },
}, { timestamps: true });

eventSchema.index({ collegeID: 1, title: 1 }, { unique: true });

const Events = mongoose.model('events', eventSchema);
module.exports = Events;
