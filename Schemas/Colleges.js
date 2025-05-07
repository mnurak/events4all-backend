const mongoose = require("mongoose");

const collegeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true
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
  address: {
    type:String,
    required:true
  },
  phoneNumber:{
    type: String,
    required:true
  }
});


const Colleges = mongoose.model('colleges', collegeSchema)
module.exports = Colleges;