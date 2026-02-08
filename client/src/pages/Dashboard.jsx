import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ExerciseManager from '../components/ExerciseManager';
import ProgressTracker from '../components/ProgressTracker';
import RecentWorkouts from '../components/RecentWorkouts';
import { Loader2, BarChart2 } from 'lucide-react';
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileViewMode, setMobileViewMode] = useState('log'); // 'log' | 'manage'

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
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleWorkoutAdded = (newWorkout) => {
    setWorkouts([newWorkout, ...workouts]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Mobile Toggle: Log vs Manage */}
      <div className="lg:hidden flex bg-gray-100 p-1 rounded-xl mb-4">
        <button 
          onClick={() => setMobileViewMode('log')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
             mobileViewMode === 'log' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
          }`}
        >
          Log Workout
        </button>
        <button 
          onClick={() => setMobileViewMode('manage')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
             mobileViewMode === 'manage' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
          }`}
        >
          Manage Exercises
        </button>
      </div>
      
      {/* Header with Analytics Link */}
      <div className="flex justify-between items-center bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
         <div>
             <h1 className="text-2xl font-bold">Welcome back!</h1>
             <p className="text-indigo-100 opacity-90">Track your progress and stay consistent.</p>
         </div>
         <Link to="/analytics" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 backdrop-blur-sm">
             <BarChart2 className="h-5 w-5" />
             <span className="hidden sm:inline">View Analytics</span>
         </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col: Exercise Manager */}
        <div className={`xl:col-span-1 space-y-6 ${mobileViewMode === 'log' ? 'hidden lg:block' : 'block'}`}>
          <ExerciseManager exercises={exercises} setExercises={setExercises} />
        </div>

        {/* Right Col: Logger & Recent History */}
        <div className={`xl:col-span-2 space-y-6 ${mobileViewMode === 'manage' ? 'hidden lg:block' : 'block'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
             <div className="h-full">
                <ProgressTracker 
                  exercises={exercises} 
                  onWorkoutAdded={handleWorkoutAdded} 
                  workouts={workouts} 
                />
             </div>
             <div className="h-[500px] lg:h-auto">
                <RecentWorkouts workouts={workouts} setWorkouts={setWorkouts} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
