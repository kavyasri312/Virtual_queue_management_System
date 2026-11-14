import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'WAITING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CALLED':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse font-bold';
      case 'SERVING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 animate-pulse font-bold';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'SKIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'NO_SHOW':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${getStyles()} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'CALLED' || status === 'SERVING' ? 'bg-current animate-ping' : 'bg-current opacity-70'
      }`}></span>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
