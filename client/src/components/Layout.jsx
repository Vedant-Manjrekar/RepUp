import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-colors duration-300">
      <main className="flex-1 pb-24 sm:pb-0">
        {children || <Outlet />}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
