import React from 'react';
import NewsArticleCard from './NewsArticleCard';
import { getNewsWithImpact } from '../services/newsService';

// This is the type of the props that NewsImpactDashboard expects.
// It should match the return type of getNewsWithImpact.
type NewsData = Awaited<ReturnType<typeof getNewsWithImpact>>;

interface NewsImpactDashboardProps {
  newsData: NewsData;
}

const NewsImpactDashboard: React.FC<NewsImpactDashboardProps> = ({ newsData }) => {
  const { impactCount, totalCount, impactfulArticles } = newsData;
  const relevancePercentage = totalCount > 0 ? Math.round((impactCount / totalCount) * 100) : 0;

  return (
    <div className="news-impact-dashboard">
      <div className="dashboard-header">
        <div className="hero-section">
          <h1>News Impact Filter</h1>
          <p>Filtering Trump administration news for what actually affects you and your family</p>
        </div>
        <div className="stats-container">
          <div className="stat-card one">
            <h2>{impactCount}</h2>
            <p>Articles that affect you</p>
          </div>
          <div className="stat-card two">
            <h2>{totalCount}</h2>
            <p>Total articles analyzed</p>
          </div>
          <div className="stat-card three">
            <h2>{relevancePercentage}%</h2>
            <p>Relevant to you</p>
          </div>
        </div>
      </div>

      <h2 className="dashboard-title">
        Articles That Affect You ({impactCount})
      </h2>

      {impactfulArticles.length > 0 ? (
        <div className="articles-grid">
          {impactfulArticles.map((article) => (
            <NewsArticleCard 
              key={article.url} 
              article={article}
              analysis={article.impact}
            />
          ))}
        </div>
      ) : (
        <div className="no-articles-message">
            <h3>You can relax for now.</h3>
            <p>We analyzed the latest news based on your keywords and found no articles that have a direct personal impact on you.</p>
        </div>
      )}
    </div>
  );
};

export default NewsImpactDashboard; 