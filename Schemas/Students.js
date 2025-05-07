const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  collegeID : {
    type: mongoose.Schema.Types.ObjectId,
    ref:'college'
  }
});

const Students = mongoose.model('students', studentSchema)
module.exports = Students