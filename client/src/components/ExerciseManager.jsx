import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Dumbbell, Loader2, Pencil, X } from 'lucide-react';

const PREDEFINED_MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
  'Legs', 'Core / Abs', 'Forearms', 'Glutes', 'Calves'
];

const ExerciseManager = ({ exercises, setExercises }) => {
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
        // Update existing
        const { data } = await api.put(`/exercises/${editId}`, { name, muscleGroup }, config);
        setExercises(exercises.map(ex => ex._id === editId ? data : ex));
        setEditId(null);
      } else {
        // Create new
        const { data } = await api.post('/exercises', { name, muscleGroup }, config);
        setExercises([...exercises, data]);
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
      setExercises(exercises.filter((ex) => ex._id !== id));
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-violet-100 p-2 rounded-lg">
          <Dumbbell className="h-5 w-5 text-violet-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Manage Exercises</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Exercise Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400"
            placeholder="e.g. Bench Press"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Muscle Group</label>
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
              className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-gray-700"
            >
              <option value="" disabled>Select a muscle group</option>
              {PREDEFINED_MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
              <option value="Other">Other (Type manually)...</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Type custom muscle group..."
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setMuscleGroup('');
                }}
                className="mt-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
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
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                <X className="h-4 w-4" />
                Cancel
                </button>
            )}
            <button
            type="submit"
            disabled={loading || !name || !muscleGroup}
            className={`flex-[2] text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                editId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-violet-600 hover:bg-violet-700'
            }`}
            >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
            {editId ? 'Update Exercise' : 'Add Exercise'}
            </button>
        </div>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {exercises.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No exercises added yet. Start by adding one above!
          </div>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise._id}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                  editId === exercise._id 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
              }`}
            >
              <div>
                <h3 className={`font-medium ${editId === exercise._id ? 'text-indigo-900' : 'text-gray-900'}`}>{exercise.name}</h3>
                <span className="text-xs text-gray-500 bg-white/50 px-2 py-0.5 rounded-full">
                  {exercise.muscleGroup}
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => startEdit(exercise)}
                    className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                    title="Edit"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={() => deleteExercise(exercise._id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Delete"
                >
                    <Trash2 className="h-4 w-4" />
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
