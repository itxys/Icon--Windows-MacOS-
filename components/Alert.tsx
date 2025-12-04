import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const styles = {
    error: "bg-red-900/20 border-red-900/50 text-red-200",
    success: "bg-green-900/20 border-green-900/50 text-green-200",
    info: "bg-blue-900/20 border-blue-900/50 text-blue-200"
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    info: <AlertCircle className="w-5 h-5 flex-shrink-0" /> // Using generic alert for info for now
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles[type]} animate-in fade-in slide-in-from-top-2 duration-300`}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
