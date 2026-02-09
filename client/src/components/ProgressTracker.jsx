import { useState, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Activity, Calendar, Save, Loader2 } from 'lucide-react';

const ProgressTracker = ({ exercises, onWorkoutAdded, workouts = [] }) => {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Get unique muscle groups from exercises
  const muscleGroups = useMemo(() => {
    const groups = new Set(exercises.map(ex => ex.muscleGroup));
    return Array.from(groups).sort();
  }, [exercises]);

  // Filter exercises based on selected muscle group
  const filteredExercises = useMemo(() => {
    if (!selectedMuscleGroup) return exercises;
    return exercises.filter(ex => ex.muscleGroup === selectedMuscleGroup);
  }, [exercises, selectedMuscleGroup]);

  // Calculate PRs
  const prStats = useMemo(() => {
    if (!selectedExercise || !workouts.length) return null;

    const exerciseWorkouts = workouts.filter(w => {
       const wExerciseId = typeof w.exercise === 'object' ? w.exercise._id : w.exercise;
       return wExerciseId === selectedExercise;
    });

    if (exerciseWorkouts.length === 0) return null;

    const maxWeight = Math.max(...exerciseWorkouts.map(w => w.weight));
    
    // Find workouts achieved AT the max weight
    const maxWeightWorkouts = exerciseWorkouts.filter(w => w.weight === maxWeight);
    
    // Get best reps and sets achieved at that record weight
    const maxReps = Math.max(...maxWeightWorkouts.map(w => w.reps));
    const maxSets = Math.max(...maxWeightWorkouts.map(w => w.sets));

    return { maxWeight, maxReps, maxSets };
  }, [selectedExercise, workouts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExercise || !weight || !reps || !sets) return;

    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const workoutData = {
        exerciseId: selectedExercise,
        weight: Number(weight),
        reps: Number(reps),
        sets: Number(sets),
        date,
      };

      const { data } = await api.post('/workouts', workoutData, config);

      onWorkoutAdded(data);
      
      // Reset form but keep date and exercise potentially
      setWeight('');
      setReps('');
      setSets('');
    } catch (error) {
      console.error('Error logging workout:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-full transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-emerald-100 dark:bg-dark-teal/20 p-2 rounded-lg">
          <Activity className="h-5 w-5 text-emerald-600 dark:text-teal-accent" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Log Workout</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Muscle Group</label>
            <select
              value={selectedMuscleGroup}
              onChange={(e) => {
                setSelectedMuscleGroup(e.target.value);
                setSelectedExercise(''); // Reset exercise when muscle group changes
              }}
              className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer dark:text-gray-100"
            >
              <option value="" className="dark:bg-gray-800">All Muscle Groups</option>
              {muscleGroups.map((group) => (
                <option key={group} value={group} className="dark:bg-gray-800">
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Exercise</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer dark:text-gray-100"
            >
              <option value="" className="dark:bg-gray-800">Select Exercise</option>
              {filteredExercises.map((ex) => (
                <option key={ex._id} value={ex._id} className="dark:bg-gray-800">
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>
          
          {/* PR Stats Badge */}
          {prStats && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="bg-amber-50 dark:bg-dark-teal/10 border border-amber-100 dark:border-dark-teal/20 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase text-amber-600 dark:text-teal-accent font-bold tracking-wider">Max Weight</div>
                <div className="text-sm font-bold text-amber-700 dark:text-teal-accent/90">{prStats.maxWeight} <span className="text-[10px] font-normal">kg</span></div>
              </div>
               <div className="bg-amber-50 dark:bg-dark-teal/10 border border-amber-100 dark:border-dark-teal/20 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase text-amber-600 dark:text-teal-accent font-bold tracking-wider">Best Sets</div>
                <div className="text-sm font-bold text-amber-700 dark:text-teal-accent/90">{prStats.maxSets}</div>
              </div>
               <div className="bg-amber-50 dark:bg-dark-teal/10 border border-amber-100 dark:border-dark-teal/20 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase text-amber-600 dark:text-teal-accent font-bold tracking-wider">Best Reps</div>
                <div className="text-sm font-bold text-amber-700 dark:text-teal-accent/90">{prStats.maxReps}</div>
              </div>
            </div>
          )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:text-gray-100"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Sets</label>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:text-gray-100"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:text-gray-100"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-600 dark:text-gray-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedExercise || !weight || !reps || !sets}
          className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Log Set
        </button>
      </form>
    </div>
  );
};

export default ProgressTracker;
