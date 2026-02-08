import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Save, Check } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RecentWorkouts = ({ workouts, setWorkouts }) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(false);

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
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Recent Logs</h2>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">{workouts.length} entries</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {/* Desktop Table View (Hidden on Mobile) */}
        <table className="w-full text-left border-collapse hidden sm:table">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[40%]">Exercise</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[30%]">Load</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-[30%]">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {workouts.map((workout) => (
              <tr key={workout._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {workout.exercise?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {workout.exercise?.muscleGroup}
                  </div>
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
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{workout.weight} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">kg</span></span>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
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
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {format(new Date(workout.date), 'MMM d')}
                        </div>
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            {workouts.map((workout) => (
              <div key={workout._id} className="p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                                  <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Weight</label>
                                  <input 
                                     type="number" 
                                     value={editValues.weight} 
                                     onChange={e => setEditValues({...editValues, weight: e.target.value})}
                                     className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100"
                                   />
                              </div>
                              <div className="flex flex-col w-1/3">
                                  <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Sets</label>
                                  <input 
                                     type="number" 
                                     value={editValues.sets} 
                                     onChange={e => setEditValues({...editValues, sets: e.target.value})}
                                     className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100"
                                   />
                              </div>
                              <div className="flex flex-col w-1/3">
                                  <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Reps</label>
                                  <input 
                                     type="number" 
                                     value={editValues.reps} 
                                     onChange={e => setEditValues({...editValues, reps: e.target.value})}
                                     className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded dark:text-gray-100"
                                   />
                              </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => saveEdit(workout._id)} className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-sm font-medium">Save Changes</button>
                             <button onClick={cancelEdit} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-1.5 rounded-lg text-sm font-medium">Cancel</button>
                          </div>
                      </div>
                  ) : (
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{workout.exercise?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{workout.exercise?.muscleGroup}</div>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">{workout.weight}kg</span>
                                <span className="text-gray-400 dark:text-gray-600">|</span>
                                <span>{workout.sets} × {workout.reps}</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end justify-between h-full gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{format(new Date(workout.date), 'MMM d')}</span>
                            <div className="flex gap-3">
                                <button onClick={() => startEdit(workout)} className="p-1.5 text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(workout._id)} className="p-1.5 text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>
                  )}
              </div>
            ))}
         </div>
        
        {workouts.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2">
             <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-full">
               <Save className="h-6 w-6 text-gray-300 dark:text-gray-600" />
             </div>
             <p className="text-sm">No recent logs found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentWorkouts;
