import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getStyles = () => {
    switch (priority) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'PERSON_WITH_DISABILITY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SENIOR_CITIZEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NORMAL':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'EMERGENCY':
        return 'Emergency';
      case 'PERSON_WITH_DISABILITY':
        return 'PWD';
      case 'SENIOR_CITIZEN':
        return 'Senior Citizen (60+)';
      case 'NORMAL':
      default:
        return 'Standard';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyles()}`}>
      {priority === 'EMERGENCY' && <span className="mr-1 text-red-600">🚨</span>}
      {priority === 'PERSON_WITH_DISABILITY' && <span className="mr-1">♿</span>}
      {priority === 'SENIOR_CITIZEN' && <span className="mr-1">👴</span>}
      {getLabel()}
    </span>
  );
};

export default PriorityBadge;
