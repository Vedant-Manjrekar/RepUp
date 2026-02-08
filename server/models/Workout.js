const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Exercise',
  },
  sets: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
