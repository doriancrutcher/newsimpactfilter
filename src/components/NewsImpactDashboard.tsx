import React from 'react';
import NewsArticleCard from './NewsArticleCard';
import ImpactSummary from './ImpactSummary';
import { getNewsWithImpact } from '../services/newsService';

// This is the type of the props that NewsImpactDashboard expects.
// It should match the return type of getNewsWithImpact.
type NewsData = Awaited<ReturnType<typeof getNewsWithImpact>>;

interface NewsImpactDashboardProps {
  newsData: NewsData;
  showAll: boolean; // This prop controls which articles to display
}

const NewsImpactDashboard = ({ newsData, showAll }: NewsImpactDashboardProps) => {
  const { impactCount, totalCount, allArticles, impactfulArticles } = newsData;
  
  const articlesToDisplay = showAll ? allArticles : impactfulArticles;
  const displayMessage = showAll 
    ? `Showing all ${totalCount} stories fetched.` 
    : `Showing ${impactCount} of ${totalCount} stories that directly affect you.`;

  return (
    <div className="news-impact-dashboard">
      <div className="dashboard-header">
        <div className="hero-section">
          <h1>News Impact Filter</h1>
          <p>Filtering Trump administration news for what actually affects you and your family</p>
        </div>
        <ImpactSummary impactCount={impactCount} totalCount={totalCount} />
      </div>

      <h2 className="dashboard-title">
        {displayMessage}
      </h2>

      {articlesToDisplay.length > 0 ? (
        <div className="articles-grid">
          {articlesToDisplay.map((article) => (
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