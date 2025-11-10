import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PremiumStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  subtitle,
  color = 'indigo',
  delay = 0
}) {
  const colorSchemes = {
    indigo: {
      gradient: 'from-indigo-500/10 to-indigo-600/5',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconRing: 'ring-indigo-500/20',
      trendColor: 'text-indigo-600',
      hoverShadow: 'hover:shadow-indigo-500/20'
    },
    violet: {
      gradient: 'from-violet-500/10 to-violet-600/5',
      iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
      iconRing: 'ring-violet-500/20',
      trendColor: 'text-violet-600',
      hoverShadow: 'hover:shadow-violet-500/20'
    },
    cyan: {
      gradient: 'from-cyan-500/10 to-cyan-600/5',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      iconRing: 'ring-cyan-500/20',
      trendColor: 'text-cyan-600',
      hoverShadow: 'hover:shadow-cyan-500/20'
    },
    green: {
      gradient: 'from-green-500/10 to-green-600/5',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      iconRing: 'ring-green-500/20',
      trendColor: 'text-green-600',
      hoverShadow: 'hover:shadow-green-500/20'
    },
    orange: {
      gradient: 'from-orange-500/10 to-orange-600/5',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconRing: 'ring-orange-500/20',
      trendColor: 'text-orange-600',
      hoverShadow: 'hover:shadow-orange-500/20'
    },
    purple: {
      gradient: 'from-purple-500/10 to-purple-600/5',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconRing: 'ring-purple-500/20',
      trendColor: 'text-purple-600',
      hoverShadow: 'hover:shadow-purple-500/20'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div 
      className={`premium-stat-card bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl ${scheme.hoverShadow} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${scheme.iconBg} ring-8 ${scheme.iconRing} shadow-lg`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
