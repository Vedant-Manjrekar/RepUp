import { useState } from 'react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {isLogin ? (
          <Login switchToSignup={() => setIsLogin(false)} />
        ) : (
          <Signup switchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
