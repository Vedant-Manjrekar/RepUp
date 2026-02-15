import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ExerciseRecords from './pages/ExerciseRecords';
import SessionDetails from './pages/SessionDetails';
import Layout from './components/Layout'; // Added import for Layout

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
       <Route
        path="/auth"
        element={!user ? <AuthPage /> : <Navigate to="/" replace />}
      />
      {/* Authenticated routes wrapped with Layout */}
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <ExerciseRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/:date/:muscle"
          element={
            <ProtectedRoute>
              <SessionDetails />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-300">
              <Header />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-4">
                <AppRoutes />
              </main>
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
