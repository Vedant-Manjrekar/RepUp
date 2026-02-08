import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, ChevronDown, Trophy } from 'lucide-react';

const ActivityGraph = ({ workouts, exercises, selectedExerciseId, onSelectExercise }) => {
  const chartData = useMemo(() => {
    if (!workouts || !selectedExerciseId) return [];

    return workouts
      .filter((workout) => {
        const wExerciseId = typeof workout.exercise === 'object' ? workout.exercise._id : workout.exercise;
        return wExerciseId === selectedExerciseId;
      })
      .map((workout) => {
        const date = new Date(workout.date);
        return {
           timestamp: date.getTime(),
           dateStr: date.toLocaleDateString(),
           weight: workout.weight,
           reps: workout.reps,
           sets: workout.sets,
           id: workout._id
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [workouts, selectedExerciseId]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return { latest: 0, pr: 0 };
    
    const latest = chartData[chartData.length - 1].weight;
    const pr = Math.max(...chartData.map(d => d.weight));
    
    return { latest, pr };
  }, [chartData]);

  const selectedExerciseName = useMemo(() => {
    const ex = exercises.find(e => e._id === selectedExerciseId);
    return ex ? ex.name : '';
  }, [exercises, selectedExerciseId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPR = data.weight === stats.pr;

      return (
        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-indigo-50 dark:border-gray-800 min-w-[140px] transition-colors duration-300">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5 uppercase tracking-wider">{selectedExerciseName}</p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
             <p className="text-lg font-bold text-indigo-900 dark:text-gray-100">{data.weight} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">kg</span></p>
             {isPR && <Trophy className="h-3 w-3 text-amber-500 ml-1" />}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-3 pl-3 border-t border-gray-100 dark:border-gray-800 pt-2">
             <span><span className="font-semibold text-gray-700 dark:text-gray-300">{data.sets}</span> sets</span>
             <span><span className="font-semibold text-gray-700 dark:text-gray-300">{data.reps}</span> reps</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
       <div className="flex justify-between items-start mb-6">
           <div>
               <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Performance</h2>
               <div className="flex items-center gap-4 mt-2">
                 <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.latest > 0 ? `${stats.latest}kg` : '-'}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Latest</p>
                 </div>
                 <div className="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
                 <div>
                    <div className="flex items-center gap-1">
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{stats.pr > 0 ? `${stats.pr}kg` : '-'}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Personal Best</p>
                 </div>
               </div>
           </div>
           
           <div className="relative">
              <select
                value={selectedExerciseId}
                onChange={(e) => onSelectExercise(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-200 dark:hover:border-gray-700 text-[10px] font-bold py-1 pl-2 pr-5 rounded-lg cursor-pointer focus:outline-none transition-all max-w-[140px] shadow-sm"
              >
                <option value="" className="dark:bg-gray-900">Select Exercise</option>
                {exercises.map((ex) => (
                  <option key={ex._id} value={ex._id} className="dark:bg-gray-900">
                    {ex.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
           </div>
       </div>

      <div style={{ width: '100%', height: 250, marginLeft: -13 }}>
        {selectedExerciseId && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(undefined, { weekday: 'narrow' })}
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ dy: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <BarChart3 className="h-10 w-10 mb-2 opacity-10" />
            <p className="text-xs">Select exercise to view progress</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityGraph;
