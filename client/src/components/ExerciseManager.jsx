import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Dumbbell, Loader2, Pencil, X, Save } from 'lucide-react';

const PREDEFINED_MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
  'Legs', 'Core / Abs', 'Forearms', 'Glutes', 'Calves'
];

const ExerciseManager = () => { // Removed props
  const { exercises, addExercise, refreshData } = useData(); // Use context
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !muscleGroup) return;

    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (editId) {
        // Update existing - Context unfortunately doesn't have updateExercise yet, so we'll trigger a refresh or add it to context if I update context
        // Wait, I didn't add updateExercise to DataContext. 
        // I should probably add it or just call refreshData() to keep it simple for now, or fetch updated list.
        await api.put(`/exercises/${editId}`, { name, muscleGroup }, config);
        // ideally update local state via context, but for now specific update:
        refreshData(); 
        setEditId(null);
      } else {
        // Create new
        const { data } = await api.post('/exercises', { name, muscleGroup }, config);
        addExercise(data);
      }

      setName('');
      setMuscleGroup('');
      setShowCustomInput(false);
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
    setLoading(false);
  };

  const deleteExercise = async (id) => {
    if (!window.confirm('Are you sure? This will delete all history for this exercise.')) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await api.delete(`/exercises/${id}`, config);
      // exercises.filter... needs to happen in context. 
      // I didn't add deleteExercise to context. calls refreshData for now.
      refreshData();
      if (editId === id) cancelEdit();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const startEdit = (exercise) => {
    setEditId(exercise._id);
    setName(exercise.name);
    if (PREDEFINED_MUSCLE_GROUPS.includes(exercise.muscleGroup)) {
      setMuscleGroup(exercise.muscleGroup);
      setShowCustomInput(false);
    } else {
      setMuscleGroup(exercise.muscleGroup);
      setShowCustomInput(true);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setMuscleGroup('');
    setShowCustomInput(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`${editId ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-violet-100 dark:bg-dark-teal/20'} p-2 rounded-lg transition-colors`}>
            <Dumbbell className={`h-5 w-5 ${editId ? 'text-indigo-600' : 'text-violet-600 dark:text-teal-accent'}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {editId ? 'Edit Exercise' : 'Manage Exercises'}
            </h2>
            {editId && <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">Currently Editing</p>}
          </div>
        </div>
        {editId && (
          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Exercise Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:text-gray-100"
            placeholder="e.g. Bench Press"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Muscle Group</label>
          {!showCustomInput ? (
            <select
              value={muscleGroup}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  setShowCustomInput(true);
                  setMuscleGroup('');
                } else {
                  setMuscleGroup(e.target.value);
                }
              }}
              className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-gray-700 dark:text-gray-200"
            >
              <option value="" disabled className="dark:bg-gray-800">Select a muscle group</option>
              {PREDEFINED_MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group} className="dark:bg-gray-800">{group}</option>
              ))}
              <option value="Other" className="dark:bg-gray-800">Other (Type manually)...</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:text-gray-100"
                placeholder="Type custom muscle group..."
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setMuscleGroup('');
                }}
                className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-colors"
                title="Back to list"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
            {editId && (
                <button
                type="button"
                onClick={cancelEdit}
                disabled={loading}
                className="flex-1 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2"
                >
                Cancel
                </button>
            )}
            <button
            type="submit"
            disabled={loading || !name || !muscleGroup}
            className={`flex-[2] text-white font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                editId ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700' : 'bg-violet-600 hover:bg-violet-700 dark:bg-teal-600 dark:hover:bg-teal-700'
            }`}
            >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
            {editId ? 'Save Changes' : 'Add Exercise'}
            </button>
        </div>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {exercises.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No exercises added yet. Start by adding one above!
          </div>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise._id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                  editId === exercise._id 
                  ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 shadow-sm' 
                  : 'bg-white dark:bg-dark-bg/30 border-gray-200 dark:border-gray-800/50 hover:border-violet-200 dark:hover:border-teal-accent/30 hover:bg-white dark:hover:bg-dark-bg transition-all'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editId === exercise._id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-white dark:bg-dark-card text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800'}`}>
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${editId === exercise._id ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>{exercise.name}</h3>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {exercise.muscleGroup}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                    onClick={() => startEdit(exercise)}
                    className={`p-2 rounded-lg transition-all ${
                        editId === exercise._id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-white dark:bg-dark-card text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-teal-accent border border-gray-100 dark:border-gray-800'
                    }`}
                    title="Edit"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => deleteExercise(exercise._id)}
                    className="p-2 rounded-lg bg-white dark:bg-dark-card text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 border border-gray-100 dark:border-gray-800 transition-all"
                    title="Delete"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseManager;
