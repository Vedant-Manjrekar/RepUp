import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = ({ switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    if (!res.success) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
          Welcome Back
        </h2>
        <p className="text-gray-500 mt-2">Sign in to track your progress</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button
          onClick={switchToSignup}
          className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-all"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Login;
