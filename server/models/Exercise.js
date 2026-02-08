const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  muscleGroup: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
