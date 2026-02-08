const Exercise = require('../models/Exercise');

// @desc    Get all exercises for a user
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({ user: req.user._id });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res) => {
  const { name, muscleGroup } = req.body;

  if (!name || !muscleGroup) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    const exercise = await Exercise.create({
      user: req.user._id,
      name,
      muscleGroup,
    });
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the exercise user
    if (exercise.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await exercise.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an exercise
// @route   PUT /api/exercises/:id
// @access  Private
const updateExercise = async (req, res) => {
  const { name, muscleGroup } = req.body;

  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the exercise user
    if (exercise.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    exercise.name = name || exercise.name;
    exercise.muscleGroup = muscleGroup || exercise.muscleGroup;

    const updatedExercise = await exercise.save();

    res.json(updatedExercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExercises,
  createExercise,
  deleteExercise,
  updateExercise,
};
