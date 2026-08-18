import React from 'react';

const RiskBadge = ({ level }) => {
  const getBadgeClass = (level) => {
    switch (level) {
      case 'Low':
        return 'badge-low';
      case 'Medium':
        return 'badge-medium';
      case 'High':
        return 'badge-high';
      default:
        return 'badge-low';
    }
  };

  const getIcon = (level) => {
    switch (level) {
      case 'Low':
        return '✅';
      case 'Medium':
        return '⚠️';
      case 'High':
        return '🚨';
      default:
        return '✅';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(level)}`}>
      <span className="mr-1">{getIcon(level)}</span>
      {level} Risk
    </span>
  );
};

export default RiskBadge;







