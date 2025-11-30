import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  subtitle
}) {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-600',
    secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
    success: 'bg-gradient-to-br from-success-500 to-success-600',
    warning: 'bg-gradient-to-br from-warning-500 to-warning-600',
    danger: 'bg-gradient-to-br from-danger-500 to-danger-600',
  };

  const bgClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    secondary: 'bg-secondary-50 dark:bg-secondary-900/20',
    success: 'bg-success-50 dark:bg-success-900/20',
    warning: 'bg-warning-50 dark:bg-warning-900/20',
    danger: 'bg-danger-50 dark:bg-danger-900/20',
  };

  return (
    <Card className="glass-card card-hover-lift fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {value}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-success-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger-500" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
                  {trendValue}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={`${bgClasses[color]} p-3 rounded-xl`}>
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
              {Icon && <Icon className="w-6 h-6 text-white" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
