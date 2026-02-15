import { useState, useEffect, useMemo } from 'react';
import { Loader2, User, Dumbbell, Layers, Scale, TrendingUp, TrendingDown, ChevronDown, Target } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ActivityGraph from '../components/ActivityGraph';
import MuscleProgressChart from '../components/MuscleProgressChart';
import StatCard from '../components/StatCard';

const PREDEFINED_MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
  'Legs', 'Core / Abs', 'Forearms', 'Glutes', 'Calves'
];

const Analytics = () => {
  const { user } = useAuth();
  const { exercises, workouts, loading } = useData();
  const [timeframe, setTimeframe] = useState('week'); // 'day' | 'week' | 'month' | 'year' | 'all'
  const [selectedMuscle, setSelectedMuscle] = useState('Chest');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  useEffect(() => {
    if (!loading && exercises.length > 0) {
        // Find first exercise that matches the default muscle
        const firstEx = exercises.find(ex => ex.muscleGroup === 'Chest');
        if (firstEx) {
            setSelectedExerciseId(firstEx._id);
        } else if (exercises.length > 0) {
            setSelectedExerciseId(exercises[0]._id);
            setSelectedMuscle(exercises[0].muscleGroup);
        }
    }
  }, [loading, exercises]);

  // Handle muscle change
  const handleMuscleChange = (muscle) => {
    setSelectedMuscle(muscle);
    // Find first exercise in this muscle group and select it
    const relevantEx = exercises.find(ex => ex.muscleGroup === muscle);
    if (relevantEx) {
        setSelectedExerciseId(relevantEx._id);
    } else {
        setSelectedExerciseId('');
    }
  };

  const filterWorkoutsByTimeframe = (data) => {
    if (timeframe === 'all') return data;
    const now = new Date();
    const cutoffDate = new Date();
    switch (timeframe) {
      case 'day': cutoffDate.setDate(now.getDate() - 1); break;
      case 'week': cutoffDate.setDate(now.getDate() - 7); break;
      case 'month': cutoffDate.setMonth(now.getMonth() - 1); break;
      case 'year': cutoffDate.setFullYear(now.getFullYear() - 1); break;
      default: return data;
    }
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredWorkouts = useMemo(() => filterWorkoutsByTimeframe(workouts), [workouts, timeframe]);

  // Derived list of exercises for the current muscle
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => ex.muscleGroup === selectedMuscle);
  }, [exercises, selectedMuscle]);

  // Calculate Stats
  const stats = useMemo(() => {
    // Filter workouts by both timeframe AND muscle group
    const muscleAndDateFiltered = filteredWorkouts.filter(w => {
      const exerciseId = typeof w.exercise === 'object' ? w.exercise._id : w.exercise;
      const correspondingExercise = exercises.find(ex => ex._id === exerciseId);
      return correspondingExercise && correspondingExercise.muscleGroup === selectedMuscle;
    });

    const totalWorkouts = muscleAndDateFiltered.length;
    const totalSets = muscleAndDateFiltered.reduce((sum, w) => sum + (w.sets || 0), 0);
    const totalVolume = muscleAndDateFiltered.reduce((sum, w) => sum + (w.weight * w.reps * w.sets), 0);
    
    // Muscle Volume Stats for selected muscle group (comparing sessions)
    let strengthStatus = "No Data";
    let trend = "neutral";

    if (selectedMuscle && workouts.length > 0) {
        // Filter and group by session (date)
        const muscleWorkouts = workouts.filter(w => {
            // Ensure w.exercise is an object before accessing muscleGroup
            const exerciseId = typeof w.exercise === 'object' ? w.exercise._id : w.exercise;
            const correspondingExercise = exercises.find(ex => ex._id === exerciseId);
            return correspondingExercise && correspondingExercise.muscleGroup === selectedMuscle;
        });

        // Group by date and calculate volumes
        const sessionVolumes = muscleWorkouts.reduce((acc, w) => {
            const dateStr = new Date(w.date).toLocaleDateString();
            acc[dateStr] = (acc[dateStr] || 0) + (w.weight * w.reps * w.sets);
            return acc;
        }, {});

        // Sort sessions by date
        const sortedSessions = Object.entries(sessionVolumes)
            .map(([date, vol]) => ({ date: new Date(date), vol }))
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first

        if (sortedSessions.length >= 1) {
            const latestVol = sortedSessions[0].vol;
            
            if (sortedSessions.length >= 2) {
                const prevVol = sortedSessions[1].vol;
                
                if (latestVol > prevVol) {
                    strengthStatus = "Improved";
                    trend = "up";
                } else if (latestVol < prevVol) {
                    // Calculate percentage decrease or just say "Decreased"
                    const diff = prevVol - latestVol;
                    strengthStatus = `${Math.round((diff/prevVol) * 100)}% Down`;
                    trend = "down";
                } else {
                    strengthStatus = "Stable";
                    trend = "up";
                }
            } else {
                strengthStatus = "Baseline Set";
                trend = "up";
            }
        }
    }

    return { totalWorkouts, totalSets, totalVolume, strengthStatus, trend };
  }, [filteredWorkouts, selectedMuscle, workouts, exercises]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-teal-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20 sm:pb-8 transition-colors duration-300">
       <div className="max-w-7xl mx-auto px-4 pt-1 pb-4">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track your progress and performance</p>
             </div>
             <div className="flex gap-2">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
             </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2 mb-6">
             {/* Muscle Filter */}
             <div className="bg-white dark:bg-dark-card p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center pr-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-dark-teal/20 flex items-center justify-center mr-2">
                   <Target className="h-3.5 w-3.5 text-indigo-600 dark:text-teal-accent" />
                </div>
                <div className="relative">
                   <select
                     value={selectedMuscle}
                     onChange={(e) => handleMuscleChange(e.target.value)}
                     className="appearance-none bg-transparent text-[11px] font-bold text-gray-900 dark:text-gray-100 py-1 pl-1 pr-5 cursor-pointer focus:outline-none"
                   >
                     {PREDEFINED_MUSCLE_GROUPS.map(muscle => (
                       <option key={muscle} value={muscle} className="dark:bg-dark-card">{muscle}</option>
                     ))}
                   </select>
                   <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
             </div>

             {/* Timeframe Selector */}
             <div className="bg-white dark:bg-dark-card p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex">
                {['week', 'month', 'year', 'all'].map((tf) => (
                   <button
                   key={tf}
                   onClick={() => setTimeframe(tf)}
                   className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all capitalize ${
                      timeframe === tf
                         ? 'bg-gray-900 dark:bg-teal-accent text-white dark:text-white shadow-md'
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                   }`}
                   >
                   {tf}
                   </button>
                 ))}
              </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                icon={Dumbbell} 
                label="Workouts" 
                value={stats.totalWorkouts} 
                color="indigo" 
                trend="up" 
                trendValue={timeframe === 'all' ? '' : `${timeframe}`} 
              />
              <StatCard 
                icon={Scale} 
                label="Volume" 
                value={`${(stats.totalVolume / 1000).toFixed(1)}k`} 
                color="emerald" 
              />
              <StatCard 
                icon={Layers} 
                label="Sets" 
                value={stats.totalSets} 
                color="blue" 
              />
              <StatCard 
                icon={stats.trend === 'up' ? TrendingUp : TrendingDown} 
                label="Strength" 
                value={stats.strengthStatus} 
                color={stats.trend === 'up' ? 'emerald' : 'orange'} 
                trend={stats.trend}
              />
           </div>

           {/* Charts Section */}
           <div className="space-y-6">

              <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                 <MuscleProgressChart 
                     workouts={filteredWorkouts} 
                     selectedMuscle={selectedMuscle}
                 />
              </div>

             
              <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                 <ActivityGraph 
                     workouts={filteredWorkouts} 
                     exercises={filteredExercises} 
                     selectedExerciseId={selectedExerciseId}
                     onSelectExercise={setSelectedExerciseId}
                 />
              </div>

           </div>
        </div>
     </div>
  );
};

export default Analytics;
