import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Save, Check, Filter } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RecentWorkouts = ({ workouts, setWorkouts }) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  const muscleGroups = useMemo(() => {
    const groups = ['All', ...new Set(workouts.map(w => w.exercise?.muscleGroup).filter(Boolean))];
    return groups.sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    if (selectedMuscle === 'All') return workouts;
    return workouts.filter(w => w.exercise?.muscleGroup === selectedMuscle);
  }, [workouts, selectedMuscle]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.delete(`/workouts/${id}`, config);
      setWorkouts(workouts.filter(w => w._id !== id));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const startEdit = (workout) => {
    setEditingId(workout._id);
    setEditValues({
      weight: workout.weight,
      reps: workout.reps,
      sets: workout.sets,
      date: new Date(workout.date).toISOString().split('T')[0]
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data } = await api.put(`/workouts/${id}`, editValues, config);
      
      // Update local state
      setWorkouts(workouts.map(w => w._id === id ? data : w));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating workout:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">Recent Logs</h2>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-dark-bg px-2 py-1 rounded-full">{workouts.length} total</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="flex p-1 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-gray-800">
            {muscleGroups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedMuscle(group)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider ${
                  selectedMuscle === group
                    ? 'bg-white dark:bg-dark-card text-indigo-600 dark:text-teal-accent shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </div>
      
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {/* Desktop Table View (Hidden on Mobile) */}
          <table className="w-full text-left border-collapse hidden sm:table">
            <thead className="bg-gray-50/50 dark:bg-dark-bg/80 sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[40%] text-[10px] tracking-[0.1em]">Exercise</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[30%] text-[10px] tracking-[0.1em]">Load</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-[30%] text-[10px] tracking-[0.1em]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredWorkouts.map((workout) => (
                <tr key={workout._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group/row">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm">
                      {workout.exercise?.name || 'Unknown'}
                    </div>
                    {selectedMuscle === 'All' && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        {workout.exercise?.muscleGroup}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    {editingId === workout._id ? (
                      <div className="flex flex-col gap-2 w-full max-w-[120px]">
                         <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              value={editValues.weight} 
                              onChange={e => setEditValues({...editValues, weight: e.target.value})}
                              className="w-14 px-1 py-0.5 text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100"
                              placeholder="kg"
                            />
                            <span className="text-xs text-gray-400 dark:text-gray-500">kg</span>
                         </div>
                         <div className="flex gap-1">
                            <input 
                              type="number" 
                              value={editValues.sets} 
                              onChange={e => setEditValues({...editValues, sets: e.target.value})}
                              className="w-8 px-1 py-0.5 text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 rounded text-center dark:text-gray-100"
                            />
                            <span className="text-xs text-gray-400 dark:text-gray-500">x</span>
                            <input 
                              type="number" 
                              value={editValues.reps} 
                              onChange={e => setEditValues({...editValues, reps: e.target.value})}
                              className="w-8 px-1 py-0.5 text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 rounded text-center dark:text-gray-100"
                            />
                         </div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-extrabold text-gray-900 dark:text-gray-100">{workout.weight}<span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 ml-0.5 uppercase">kg</span></span>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                          {workout.sets} sets × {workout.reps} reps
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {editingId === workout._id ? (
                       <div className="flex flex-col items-end gap-2">
                          <input 
                            type="date"
                            value={editValues.date}
                            onChange={e => setEditValues({...editValues, date: e.target.value})}
                            className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 rounded w-[110px] dark:text-gray-100" 
                          />
                          <div className="flex gap-2">
                              <button 
                                onClick={() => saveEdit(workout._id)} 
                                disabled={loading}
                                className="p-1 px-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded text-xs font-medium transition-colors"
                              >
                                Save
                              </button>
                              <button 
                                onClick={cancelEdit} 
                                className="p-1 px-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                          </div>
                       </div>
                    ) : (
                      <div className="relative group/actions">
                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                              {format(new Date(workout.date), 'MMM d')}
                          </div>
                          <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(workout)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleDelete(workout._id)} className="text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View (Visible ONLY on Mobile) */}
          <div className="sm:hidden flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
            {filteredWorkouts.map((workout) => (
              <div key={workout._id} className="p-4 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                  {editingId === workout._id ? (
                      <div className="space-y-3">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{workout.exercise?.name}</span>
                              <input 
                                type="date"
                                value={editValues.date}
                                onChange={e => setEditValues({...editValues, date: e.target.value})}
                                className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100" 
                              />
                          </div>
                          <div className="flex gap-3 items-center">
                              <div className="flex flex-col w-1/3">
                                  <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black">Weight</label>
                                  <input 
                                     type="number" 
                                     value={editValues.weight} 
                                     onChange={e => setEditValues({...editValues, weight: e.target.value})}
                                     className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100"
                                   />
                              </div>
                              <div className="flex flex-col w-1/3">
                                  <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black">Sets</label>
                                  <input 
                                     type="number" 
                                     value={editValues.sets} 
                                     onChange={e => setEditValues({...editValues, sets: e.target.value})}
                                     className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100"
                                   />
                              </div>
                              <div className="flex flex-col w-1/3">
                                  <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black">Reps</label>
                                  <input 
                                     type="number" 
                                     value={editValues.reps} 
                                     onChange={e => setEditValues({...editValues, reps: e.target.value})}
                                     className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100"
                                   />
                              </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => saveEdit(workout._id)} className="flex-1 bg-indigo-600 dark:bg-teal-accent text-white dark:text-dark-bg py-2 rounded-xl text-xs font-black uppercase tracking-widest">Save</button>
                             <button onClick={cancelEdit} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
                          </div>
                      </div>
                  ) : (
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="font-extrabold text-gray-900 dark:text-gray-100 line-clamp-1">{workout.exercise?.name || 'Unknown'}</div>
                            {selectedMuscle === 'All' && <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{workout.exercise?.muscleGroup}</div>}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="font-black text-sm text-gray-900 dark:text-gray-100">{workout.weight}<span className="text-[10px] ml-0.5 text-gray-400 uppercase">kg</span></span>
                                <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{workout.sets} × {workout.reps}</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end justify-between h-full gap-2">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{format(new Date(workout.date), 'MMM d')}</span>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(workout)} className="p-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-xl"><Pencil className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleDelete(workout._id)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-xl"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                        </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
          {filteredWorkouts.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2">
               <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-full">
                 <Save className="h-6 w-6 text-gray-300 dark:text-gray-600" />
               </div>
               <p className="text-sm uppercase text-[10px] font-black tracking-widest">No {selectedMuscle !== 'All' ? selectedMuscle : 'recent'} logs found</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default RecentWorkouts;
