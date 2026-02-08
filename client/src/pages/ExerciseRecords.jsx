import { useState, useEffect, useMemo } from 'react';
import { Loader2, Trophy, Calendar, Target, ChevronRight, Dumbbell } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ExerciseRecords = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
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

        setExercises(exercisesRes.data);
        setWorkouts(workoutsRes.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const muscleGroups = useMemo(() => {
    const groups = ['All', ...new Set(exercises.map(ex => ex.muscleGroup))];
    return groups.sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
    });
  }, [exercises]);

  const processedRecords = useMemo(() => {
    // Process each exercise to find latest and PR
    const records = exercises.map(exercise => {
      const exerciseWorkouts = workouts.filter(w => {
        const wExId = typeof w.exercise === 'object' ? w.exercise._id : w.exercise;
        return wExId === exercise._id;
      }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

      const latest = exerciseWorkouts.length > 0 ? exerciseWorkouts[0] : null;
      const prWeight = exerciseWorkouts.length > 0 
        ? Math.max(...exerciseWorkouts.map(w => w.weight)) 
        : 0;
      const prWorkout = exerciseWorkouts.find(w => w.weight === prWeight);

      return {
        ...exercise,
        latest,
        pr: prWorkout ? { weight: prWeight, reps: prWorkout.reps } : null
      };
    });

    // Filter by selected muscle
    const filtered = selectedMuscle === 'All' 
        ? records 
        : records.filter(r => r.muscleGroup === selectedMuscle);

    // Group by muscle group
    const grouped = filtered.reduce((acc, record) => {
      const group = record.muscleGroup || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(record);
      return acc;
    }, {});

    // Sort exercises WITHIN each group
    Object.keys(grouped).forEach(group => {
        grouped[group].sort((a, b) => {
            // Priority 1: Has data vs No data
            if (a.latest && !b.latest) return -1;
            if (!a.latest && b.latest) return 1;
            
            // Priority 2: Newest first (if both have data)
            if (a.latest && b.latest) {
                return new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime();
            }
            
            // Priority 3: Alphabetical (if both have no data)
            return a.name.localeCompare(b.name);
        });
    });

    return grouped;
  }, [exercises, workouts, selectedMuscle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activeGroups = Object.keys(processedRecords).sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-24 sm:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto pt-6 px-3 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exercise Records</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your personal bests and latest results</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        {/* Muscle Group Filter Bar */}
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedMuscle(group)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider border shadow-sm ${
                selectedMuscle === group
                  ? 'bg-gray-900 dark:bg-teal-accent text-white border-gray-900 dark:border-teal-accent'
                  : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-teal-accent'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {activeGroups.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 shadow-sm mt-4">
             <Dumbbell className="h-12 w-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
             <p className="text-gray-500 dark:text-gray-400 font-medium">No exercises found.</p>
             <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add exercises to the database to see them here.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {activeGroups.map(group => (
              <div key={group} className="space-y-5">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-teal-accent"></div>
                  <h2 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{group}</h2>
                  <span className="text-[10px] font-bold text-indigo-400 dark:text-teal-accent ml-auto bg-indigo-50/50 dark:bg-dark-teal/10 px-2.5 py-1 rounded-lg">
                    {processedRecords[group].length} Exercises
                  </span>
                </div>

                <div className="grid gap-4">
                  {processedRecords[group].map(exercise => (
                    <div 
                      key={exercise._id} 
                      className="bg-white dark:bg-dark-card rounded-[1.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-indigo-200 dark:hover:border-teal-accent hover:shadow-md transition-all duration-300 gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 min-w-[48px] rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          <Target className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-indigo-900 dark:group-hover:text-indigo-300">{exercise.name}</h3>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wide mt-0.5">
                            Last Active: <span className="text-gray-500 dark:text-gray-400 font-black">{exercise.latest ? new Date(exercise.latest.date).toLocaleDateString() : 'Never'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:flex items-center gap-6 sm:gap-10 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50 dark:border-gray-800">
                        {/* Latest Stats */}
                        <div className="text-left sm:text-right min-w-[70px]">
                          <div className="flex items-center justify-start sm:justify-end gap-1.5 text-gray-400 dark:text-gray-500 mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Latest</span>
                          </div>
                          <p className="text-base font-black text-gray-900 dark:text-gray-100">
                            {exercise.latest ? `${exercise.latest.weight}kg` : '-'}
                            {exercise.latest && <span className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1.5 tracking-tight">×{exercise.latest.reps}</span>}
                          </p>
                        </div>

                        {/* PR Stats */}
                        <div className="text-right min-w-[70px]">
                          <div className="flex items-center justify-end gap-1.5 text-indigo-400 dark:text-indigo-500 mb-1">
                            <Trophy className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Record</span>
                          </div>
                          <div className="flex items-center justify-end">
                            <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                                {exercise.pr ? `${exercise.pr.weight}kg` : '-'}
                                {exercise.pr && <span className="text-xs font-bold text-indigo-300 dark:text-indigo-500 ml-1.5 tracking-tight">×{exercise.pr.reps}</span>}
                            </p>
                          </div>
                        </div>
                        
                        <div className="hidden sm:block">
                           <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                              <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 dark:group-hover:text-indigo-300" />
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseRecords;
