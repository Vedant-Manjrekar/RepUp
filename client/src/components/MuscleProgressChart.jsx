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

    // Aggregate volume by date
    const volumeByDate = {};
    let totalVolume = 0;

    muscleWorkouts.forEach(w => {
      const dateKey = new Date(w.date).toLocaleDateString();
      const volume = w.weight * w.reps * w.sets;
      const exName = typeof w.exercise === 'object' ? w.exercise.name : 'Unknown';
      
      if (!volumeByDate[dateKey]) {
        volumeByDate[dateKey] = {
          date: new Date(w.date),
          volume: 0,
          timestamp: new Date(w.date).getTime(),
          exercises: []
        };
      }
      volumeByDate[dateKey].volume += volume;
      volumeByDate[dateKey].exercises.push({ name: exName, weight: w.weight, volume });
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
        <div className="bg-white p-3 rounded-lg shadow-xl border border-emerald-50 min-w-[180px]">
          <p className="text-xs font-semibold text-gray-500 mb-2">{new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          
          <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Total Volume</span>
            <div className="flex items-center gap-1.5">
                 {data.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />}
                 {data.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" strokeWidth={2.5} />}
                 {data.trend === 'same' && <Minus className="h-4 w-4 text-gray-400" strokeWidth={2.5} />}
                 <span className="font-bold text-gray-900 text-sm">{data.volume.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-1.5">
             <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Exercises</p>
             {data.exercises && data.exercises.slice(0, 5).map((ex, i) => (
                 <div key={i} className="flex justify-between text-[11px] items-center">
                     <span className="text-gray-700 font-medium line-clamp-1 max-w-[110px]">{ex.name}</span>
                     <span className="text-gray-500">{ex.weight}kg</span>
                 </div>
             ))}
             {data.exercises?.length > 5 && (
                 <div className="text-[9px] text-gray-400 italic text-center pt-1">+{data.exercises.length - 5} more</div>
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
           <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1">{selectedMuscle}</h3>
           <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Metric Over Time</h2>
           <div className="flex gap-4 mt-2">
              <div>
                  <p className="text-xl font-bold text-gray-900">{(stats.total / 1000).toFixed(1)}k</p>
                  <p className="text-[10px] text-gray-400">Total Vol</p>
              </div>
              <div className="h-8 w-px bg-gray-100"></div>
              <div>
                  <p className="text-xl font-bold text-gray-900">{stats.avg.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">Avg. Vol</p>
              </div>
           </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 250 }}>
        {chartData.data && chartData.data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.data} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
               <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorVolume)"
                fillOpacity={0.6}
              />
              <XAxis dataKey="timestamp" hide />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BarChart3 className="h-10 w-10 mb-2 opacity-10" />
            <p className="text-xs">No volume data for {selectedMuscle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MuscleProgressChart;
