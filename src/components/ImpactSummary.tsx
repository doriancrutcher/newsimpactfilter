import React from 'react';

interface ImpactSummaryProps {
  impactCount: number;
  totalCount: number;
}

const ImpactSummary: React.FC<ImpactSummaryProps> = ({ impactCount, totalCount }) => {
  const percentage = totalCount > 0 ? Math.round((impactCount / totalCount) * 100) : 0;
  
  return (
    <div className="impact-summary">
      <div className="impact-stats">
        <div className="stat-card primary">
          <h3>{impactCount}</h3>
          <p>Articles that affect you</p>
        </div>
        <div className="stat-card secondary">
          <h3>{totalCount}</h3>
          <p>Total articles analyzed</p>
        </div>
        <div className="stat-card tertiary">
          <h3>{percentage}%</h3>
          <p>Relevant to you</p>
        </div>
      </div>
      
      <div className="impact-message">
        {impactCount === 0 ? (
          <div className="good-news">
            <h4>🎉 Good News!</h4>
            <p>None of today's Trump administration news directly affects you or your family.</p>
          </div>
        ) : impactCount <= 2 ? (
          <div className="moderate-impact">
            <h4>📋 Moderate Impact</h4>
            <p>{impactCount} article{impactCount > 1 ? 's' : ''} may affect you. Worth a quick review.</p>
          </div>
        ) : (
          <div className="high-impact">
            <h4>⚠️ High Impact</h4>
            <p>{impactCount} articles may significantly affect you. Consider reviewing these.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpactSummary; 