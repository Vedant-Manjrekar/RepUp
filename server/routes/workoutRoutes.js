const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  createWorkout,
  deleteWorkout,
  updateWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWorkouts).post(protect, createWorkout);
router.route('/:id').delete(protect, deleteWorkout).put(protect, updateWorkout);

module.exports = router;
