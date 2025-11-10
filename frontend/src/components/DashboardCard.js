import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardCard({ 
  title, 
  icon: Icon,
  children,
  action,
  className = '',
  delay = 0
}) {
  return (
    <div 
      className={`premium-dashboard-card bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 fade-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-6">
        {(title || action) && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl shadow-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            {action && (
              <div>{action}</div>
            )}
          </div>
        )}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
