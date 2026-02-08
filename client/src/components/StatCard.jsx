import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600', 
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-[140px]">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
            <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {trendValue}
            </div>
        )}
      </div>
      
      <div>
        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
