import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-dark-teal/10 text-indigo-600 dark:text-teal-accent',
    emerald: 'bg-emerald-50 dark:bg-dark-teal/10 text-emerald-600 dark:text-teal-accent', 
    blue: 'bg-blue-50 dark:bg-dark-teal/10 text-blue-600 dark:text-teal-accent',
    purple: 'bg-purple-50 dark:bg-dark-teal/10 text-purple-600 dark:text-teal-accent',
    orange: 'bg-orange-50 dark:bg-dark-teal/10 text-orange-600 dark:text-teal-accent',
  };

  return (
    <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-[140px] group hover:border-indigo-200 dark:hover:border-teal-accent/50 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${colorClasses[color] || colorClasses.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
            <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {trendValue}
            </div>
        )}
      </div>
      
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
