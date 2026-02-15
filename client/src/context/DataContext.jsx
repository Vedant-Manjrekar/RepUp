import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from cache initially
  useEffect(() => {
    const cachedData = localStorage.getItem('fitness_data_cache');
    if (cachedData) {
      const { exercises: cachedExercises, workouts: cachedWorkouts } = JSON.parse(cachedData);
      setExercises(cachedExercises || []);
      setWorkouts(cachedWorkouts || []);
      setLoading(false); // Show cached data immediately
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const [exercisesRes, workoutsRes] = await Promise.all([
        api.get('/exercises', config),
        api.get('/workouts', config),
      ]);

      const newExercises = exercisesRes.data;
      const newWorkouts = workoutsRes.data;

      setExercises(newExercises);
      setWorkouts(newWorkouts);
      
      // Update cache
      localStorage.setItem('fitness_data_cache', JSON.stringify({
        exercises: newExercises,
        workouts: newWorkouts
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch on user change (login)
  useEffect(() => {
    if (user) {
        refreshData();
    } else {
        // Clear data on logout
        setExercises([]);
        setWorkouts([]);
        localStorage.removeItem('fitness_data_cache');
    }
  }, [user, refreshData]);

  const addWorkout = (newWorkout) => {
    const updatedWorkouts = [newWorkout, ...workouts];
    setWorkouts(updatedWorkouts);
    localStorage.setItem('fitness_data_cache', JSON.stringify({ exercises, workouts: updatedWorkouts }));
  };

  const updateWorkout = (updatedWorkout) => {
    const updatedWorkouts = workouts.map(w => w._id === updatedWorkout._id ? updatedWorkout : w);
    setWorkouts(updatedWorkouts);
    localStorage.setItem('fitness_data_cache', JSON.stringify({ exercises, workouts: updatedWorkouts }));
  };

  const deleteWorkout = (id) => {
    const updatedWorkouts = workouts.filter(w => w._id !== id);
    setWorkouts(updatedWorkouts);
    localStorage.setItem('fitness_data_cache', JSON.stringify({ exercises, workouts: updatedWorkouts }));
  };

  const addExercise = (newExercise) => {
      const updatedExercises = [...exercises, newExercise];
      setExercises(updatedExercises);
      localStorage.setItem('fitness_data_cache', JSON.stringify({ exercises: updatedExercises, workouts }));
  }

  return (
    <DataContext.Provider value={{ 
      exercises, 
      workouts, 
      loading, 
      error, 
      refreshData,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      addExercise
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
