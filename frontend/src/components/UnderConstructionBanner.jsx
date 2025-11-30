import React from 'react';
import { Construction } from 'lucide-react';

export default function UnderConstructionBanner({ message = "This feature is currently under development" }) {
  return (
    <div
      className="
        flex items-center gap-3 px-4 py-3 rounded-lg
        bg-warning-50 dark:bg-warning-900/20
        border-warning-200 dark:border-warning-800
        text-warning-700 dark:text-warning-300
        border
      "
    >
      <Construction className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}