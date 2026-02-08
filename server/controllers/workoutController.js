const Workout = require('../models/Workout');

// @desc    Get workouts for a user (can filter by exercise or date range in future)
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id })
      .populate('exercise', 'name muscleGroup') // Populate exercise details
      .sort({ date: -1 }); // Newest first
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  const { exerciseId, sets, reps, weight, date } = req.body;

  if (!exerciseId || !sets || !reps || !weight) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  try {
    const workout = await Workout.create({
      user: req.user._id,
      exercise: exerciseId,
      sets,
      reps,
      weight,
      date: date || Date.now(),
    });

    const populatedWorkout = await Workout.findById(workout._id).populate('exercise', 'name muscleGroup');

    res.status(201).json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a workout entry
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (workout.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await workout.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a workout entry
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  const { exerciseId, sets, reps, weight, date } = req.body;

  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (workout.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    workout.exercise = exerciseId || workout.exercise;
    workout.sets = sets || workout.sets;
    workout.reps = reps || workout.reps;
    workout.weight = weight || workout.weight;
    workout.date = date || workout.date;

    const updatedWorkout = await workout.save();
    
    // Populate the exercise details for the response
    const populatedWorkout = await Workout.findById(updatedWorkout._id).populate('exercise', 'name muscleGroup');

    res.json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  deleteWorkout,
  updateWorkout,
};
