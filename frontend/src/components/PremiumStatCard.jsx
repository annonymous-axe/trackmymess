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
    primary: {
      gradient: 'from-primary-500/10 to-primary-600/5',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      iconRing: 'ring-primary-500/20',
      trendColor: 'text-primary-600',
      hoverShadow: 'hover:shadow-primary-500/20'
    },
    secondary: {
      gradient: 'from-secondary-500/10 to-secondary-600/5',
      iconBg: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
      iconRing: 'ring-secondary-500/20',
      trendColor: 'text-secondary-600',
      hoverShadow: 'hover:shadow-secondary-500/20'
    },
    success: {
      gradient: 'from-success-500/10 to-success-600/5',
      iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
      iconRing: 'ring-success-500/20',
      trendColor: 'text-success-600',
      hoverShadow: 'hover:shadow-success-500/20'
    },
    warning: {
      gradient: 'from-warning-500/10 to-warning-600/5',
      iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600',
      iconRing: 'ring-warning-500/20',
      trendColor: 'text-warning-600',
      hoverShadow: 'hover:shadow-warning-500/20'
    },
    danger: {
      gradient: 'from-danger-500/10 to-danger-600/5',
      iconBg: 'bg-gradient-to-br from-danger-500 to-danger-600',
      iconRing: 'ring-danger-500/20',
      trendColor: 'text-danger-600',
      hoverShadow: 'hover:shadow-danger-500/20'
    },
    indigo: {
      gradient: 'from-primary-500/10 to-primary-600/5',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      iconRing: 'ring-primary-500/20',
      trendColor: 'text-primary-600',
      hoverShadow: 'hover:shadow-primary-500/20'
    },
    green: {
      gradient: 'from-success-500/10 to-success-600/5',
      iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
      iconRing: 'ring-success-500/20',
      trendColor: 'text-success-600',
      hoverShadow: 'hover:shadow-success-500/20'
    },
    emerald: {
      gradient: 'from-success-500/10 to-success-600/5',
      iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
      iconRing: 'ring-success-500/20',
      trendColor: 'text-success-600',
      hoverShadow: 'hover:shadow-success-500/20'
    },
    orange: {
      gradient: 'from-warning-500/10 to-warning-600/5',
      iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600',
      iconRing: 'ring-warning-500/20',
      trendColor: 'text-warning-600',
      hoverShadow: 'hover:shadow-warning-500/20'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success-600 bg-success-50 dark:bg-success-900/20 dark:text-success-300';
    if (trend === 'down') return 'text-danger-600 bg-danger-50 dark:bg-danger-900/20 dark:text-danger-300';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div
      className={`premium-stat-card bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-xl ${scheme.hoverShadow} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer fade-in`}
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
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-foreground mb-1 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
