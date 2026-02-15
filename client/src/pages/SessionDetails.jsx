import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, Calendar, Target, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

const SessionDetails = () => {
  const { date, muscle } = useParams();
  const navigate = useNavigate();
  const { workouts, exercises, loading } = useData();

  const sessionWorkouts = useMemo(() => {
    if (loading || !workouts.length) return [];
    
    const targetDate = new Date(parseInt(date)).toLocaleDateString();
    
    return workouts.filter(w => {
      const wDate = new Date(w.date).toLocaleDateString();
      const wMuscle = typeof w.exercise === 'object' ? w.exercise.muscleGroup : '';
      return wDate === targetDate && wMuscle === muscle;
    });
  }, [workouts, date, muscle, loading]);

  const stats = useMemo(() => {
    if (!sessionWorkouts.length) return { totalVolume: 0, exerciseCount: 0 };
    const totalVolume = sessionWorkouts.reduce((sum, w) => sum + (w.weight * w.reps * w.sets), 0);
    return { totalVolume, exerciseCount: sessionWorkouts.length };
  }, [sessionWorkouts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-indigo-600 dark:hover:text-teal-accent transition-all shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Session Details</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full breakdown of your training session</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
           <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <Calendar className="h-6 w-6" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{format(new Date(parseInt(date)), 'MMMM d, yyyy')}</p>
           </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
           <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <Target className="h-6 w-6" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Muscle Group</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{muscle}</p>
           </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
           <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <Trophy className="h-6 w-6" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Volume</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.totalVolume.toLocaleString()} <span className="text-sm font-normal text-gray-400">kg</span></p>
           </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">Exercises Performed ({stats.exerciseCount})</h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {sessionWorkouts.map((w, i) => (
            <div key={i} className="p-6 flex flex-row items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="h-14 w-14 rounded-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-teal-accent border border-gray-100 dark:border-gray-700/50 shadow-sm">
                  <Target className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex flex-col justify-center leading-none">
                  <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg tracking-tight truncate leading-none mb-0.5">
                    {typeof w.exercise === 'object' ? w.exercise.name : 'Unknown'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{w.sets} S</span>
                      <span className="text-gray-200 dark:text-gray-800">•</span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{w.reps} R</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <span className="text-[10px] font-black text-indigo-500/50 dark:text-teal-accent/50 uppercase tracking-widest">Vol:</span>
                       <span className="text-[11px] font-black text-indigo-600 dark:text-teal-accent">{(w.weight * w.reps * w.sets).toLocaleString()}kg</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end flex-shrink-0 ml-auto">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-0.5 text-right">Logged Load</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                     {w.weight}
                   </span>
                   <span className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase">kg</span>
                </div>
              </div>
            </div>
          ))}
          {sessionWorkouts.length === 0 && (
              <div className="p-12 text-center text-gray-400 dark:text-gray-600">
                  <p>No workout data found for this session.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
