const mongoose = require('mongoose');

// mongoose.Schema takes in an object with fields
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now // Put current time and date automatically
  }
});

// mongoose.model('model name', 'schema')
module.exports = User = mongoose.model('user', UserSchema);
