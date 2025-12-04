import React from 'react';
import { AlertCircle, CheckCircle2, Terminal } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const styles = {
    error: "bg-red-950/30 border-red-700 text-red-400",
    success: "bg-emerald-950/30 border-emerald-700 text-emerald-400",
    info: "bg-blue-950/30 border-blue-700 text-blue-400"
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    info: <Terminal className="w-5 h-5 flex-shrink-0" />
  };

  const titles = {
    error: "SYSTEM_ERROR",
    success: "OPERATION_SUCCESS",
    info: "SYSTEM_INFO"
  };

  return (
    <div className={`flex items-start gap-4 p-4 border-l-4 ${styles[type]} animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-xs font-bold tracking-wider opacity-70 mb-1">:: {titles[type]} ::</p>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};