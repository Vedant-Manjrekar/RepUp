import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const MuscleProgressChart = ({ workouts, selectedMuscle }) => {
  const chartData = useMemo(() => {
    if (!workouts || workouts.length === 0 || !selectedMuscle) return { data: [], totalVolume: 0 };

    const muscleWorkouts = workouts.filter(w => {
      const wMuscle = typeof w.exercise === 'object' ? w.exercise.muscleGroup : '';
      return wMuscle === selectedMuscle;
    });

    if (muscleWorkouts.length === 0) return { data: [], totalVolume: 0 };

    // Aggregation preparation
    const volumeByDate = {};
    let totalVolume = 0;
    const lastWeightByEx = {};

    // Sort all workouts for this muscle chronologically to calculate trends
    const sortedWorkouts = [...muscleWorkouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedWorkouts.forEach(w => {
      const dateKey = new Date(w.date).toLocaleDateString();
      const volume = w.weight * w.reps * w.sets;
      const exName = typeof w.exercise === 'object' ? w.exercise.name : 'Unknown';
      
      // Calculate exercise trend
      const prevWeight = lastWeightByEx[exName];
      let exTrend = null;
      if (prevWeight !== undefined) {
          if (w.weight > prevWeight) exTrend = 'up';
          else if (w.weight < prevWeight) exTrend = 'down';
          else exTrend = 'same';
      }
      lastWeightByEx[exName] = w.weight;

      if (!volumeByDate[dateKey]) {
        volumeByDate[dateKey] = {
          date: new Date(w.date),
          volume: 0,
          timestamp: new Date(w.date).getTime(),
          exercises: []
        };
      }
      volumeByDate[dateKey].volume += volume;
      volumeByDate[dateKey].exercises.push({ 
          name: exName, 
          weight: w.weight, 
          volume,
          trend: exTrend
      });
      totalVolume += volume;
    });

    const sortedData = Object.values(volumeByDate)
      .map(item => ({
        timestamp: item.timestamp,
        dateStr: item.date.toLocaleDateString(),
        volume: item.volume,
        exercises: item.exercises
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate trends
    const dataWithTrend = sortedData.map((item, index) => {
        let trend = 'same';
        if (index > 0) {
            const prev = sortedData[index - 1].volume;
            if (item.volume > prev) trend = 'up';
            else if (item.volume < prev) trend = 'down';
        }
        return { ...item, trend };
    });

    return { data: dataWithTrend, totalVolume };
  }, [workouts, selectedMuscle]);

  const stats = useMemo(() => {
     if (!chartData.data || chartData.data.length === 0) return { total: 0, avg: 0 };
     const total = chartData.totalVolume || 0;
     const avg = Math.round(total / chartData.data.length);
     return { total, avg };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-emerald-50 dark:border-gray-800 min-w-[180px] transition-colors duration-300">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          
          <div className="flex items-center justify-between mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Volume</span>
            <div className="flex items-center gap-1.5">
                 {data.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />}
                 {data.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-orange-500" strokeWidth={2.5} />}
                 {data.trend === 'same' && <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" strokeWidth={2.5} />}
                 <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{data.volume.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-1.5">
             <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Exercises</p>
             {data.exercises && data.exercises.slice(0, 5).map((ex, i) => (
                 <div key={i} className="flex justify-between text-[11px] items-center">
                     <div className="flex items-center gap-1.5 min-w-0">
                        {ex.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500 flex-shrink-0" strokeWidth={3} />}
                        {ex.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-orange-500 flex-shrink-0" strokeWidth={3} />}
                        {ex.trend === 'same' && <Minus className="h-3 w-3 text-gray-300 dark:text-gray-600 flex-shrink-0" strokeWidth={3} />}
                        <span className="text-gray-700 dark:text-gray-300 font-medium line-clamp-1">{ex.name}</span>
                     </div>
                     <span className="text-gray-500 dark:text-gray-400 font-bold ml-2">{ex.weight}kg</span>
                 </div>
             ))}
             {data.exercises?.length > 5 && (
                 <div className="text-[9px] text-gray-400 dark:text-gray-500 italic text-center pt-1">+{data.exercises.length - 5} more</div>
             )}
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
           <h3 className="text-[10px] font-bold text-indigo-600 dark:text-teal-accent uppercase tracking-[0.2em] mb-1">{selectedMuscle}</h3>
           <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Metric Over Time</h2>
           <div className="flex gap-4 mt-2">
              <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{(stats.total / 1000).toFixed(1)}k</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Total Vol</p>
              </div>
              <div className="h-8 w-px bg-gray-100 dark:bg-gray-800"></div>
              <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.avg.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Avg. Vol</p>
              </div>
           </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 250 }}>
        {chartData.data && chartData.data.length > 0 ? (
          
          <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none" tabIndex={-1}>
            <AreaChart data={chartData.data} margin={{ top: 10, right: 0, bottom: 0, left: -20 }} accessibilityLayer={false} style={{ outline: 'none' }}>
               <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1"> 
                  <stop offset="5%" stopColor="#2ba09d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2ba09d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2ba09d', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#2ba09d"
                strokeWidth={3}
                fill="url(#colorVolume)"
                fillOpacity={0.6}
                dot={{ r: 4, fill: '#2ba09d', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#2ba09d', strokeWidth: 2, stroke: '#fff' }}
              />
              <XAxis dataKey="timestamp" hide />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <BarChart3 className="h-10 w-10 mb-2 opacity-10" />
            <p className="text-xs">No volume data for {selectedMuscle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MuscleProgressChart;
