import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ExerciseManager from '../components/ExerciseManager';
import ProgressTracker from '../components/ProgressTracker';
import RecentWorkouts from '../components/RecentWorkouts';
import { Loader2, BarChart2 } from 'lucide-react';
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const { loading } = useData(); // Only loading needed for spinner
  const [mobileViewMode, setMobileViewMode] = useState('log'); // 'log' | 'manage'

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
      <div className="lg:hidden flex bg-gray-100 dark:bg-dark-card p-1.5 rounded-2xl mb-4 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <button 
          onClick={() => setMobileViewMode('log')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
             mobileViewMode === 'log' 
              ? 'bg-white dark:bg-dark-bg shadow-sm dark:shadow-gray-950/50 text-indigo-600 dark:text-teal-accent ring-1 ring-gray-100/50 dark:ring-gray-800' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Log Workout
        </button>
        <button 
          onClick={() => setMobileViewMode('manage')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
             mobileViewMode === 'manage' 
              ? 'bg-white dark:bg-dark-bg shadow-sm dark:shadow-gray-950/50 text-indigo-600 dark:text-teal-accent ring-1 ring-gray-100/50 dark:ring-gray-800' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Manage Exercises
        </button>
      </div>
      
      {/* Header with Analytics Link */}
      <div className="relative overflow-hidden flex justify-between items-center bg-indigo-600 dark:bg-dark-card rounded-2xl p-6 text-white dark:text-gray-100 shadow-lg shadow-indigo-200 dark:shadow-none border border-transparent dark:border-gray-800 transition-all duration-300">
         {/* Subtle Gradient Glow for Dark Mode */}
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none hidden dark:block"></div>
         
         <div className="relative z-10">
             <h1 className="text-2xl font-bold dark:text-teal-accent">Welcome back!</h1>
             <p className="text-indigo-100 dark:text-gray-400 opacity-90">Track your progress and stay consistent.</p>
         </div>
         <Link to="/analytics" className="relative z-10 bg-white/10 dark:bg-dark-teal/10 hover:bg-white/20 dark:hover:bg-dark-teal/20 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 backdrop-blur-sm border border-transparent dark:border-dark-teal/20">
             <BarChart2 className="h-5 w-5 dark:text-teal-accent" />
             <span className="hidden sm:inline">View Analytics</span>
         </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col: Exercise Manager */}
        <div className={`xl:col-span-1 space-y-6 ${mobileViewMode === 'log' ? 'hidden lg:block' : 'block'}`}>
          <ExerciseManager />
        </div>

        {/* Right Col: Logger & Recent History */}
        <div className={`xl:col-span-2 space-y-6 ${mobileViewMode === 'manage' ? 'hidden lg:block' : 'block'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
             <div className="h-full">
                <ProgressTracker />
             </div>
             <div className="h-[500px] lg:h-auto">
                <RecentWorkouts />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
