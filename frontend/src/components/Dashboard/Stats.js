import React from 'react';

const Stats = ({ stats }) => {
  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-number">{stats.forms || 0}</div>
        <div className="stat-label">Total Forms</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.responses || 0}</div>
        <div className="stat-label">Total Responses</div>
      </div>
    </div>
  );
};

export default Stats;