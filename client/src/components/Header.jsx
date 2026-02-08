import { useAuth } from '../context/AuthContext';
import { LogOut, Dumbbell } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Exercise Tracker
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm hidden sm:block">
                Welcome, {user.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
