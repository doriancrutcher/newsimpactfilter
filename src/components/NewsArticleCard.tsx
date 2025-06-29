import React, { useState } from 'react';
import { NewsArticle, ImpactAnalysis } from '../services/newsService';

interface NewsArticleCardProps {
    article: NewsArticle;
    analysis: ImpactAnalysis;
}

const getImpactColor = (score: number) => {
    if (score >= 7) return 'high-impact';
    if (score >= 4) return 'medium-impact';
    return 'low-impact';
};

const getImpactLabel = (score: number) => {
    if (score >= 7) return 'HIGH IMPACT';
    if (score >= 4) return 'MEDIUM IMPACT';
    return 'LOW IMPACT';
};

const NewsArticleCard: React.FC<NewsArticleCardProps> = ({ article, analysis }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const impactColorClass = getImpactColor(analysis.impactScore);
    const impactLabel = getImpactLabel(analysis.impactScore);
    
    const formattedDate = new Date(article.publishedAt).toLocaleDateString();

    return (
        <div className={`news-article-card ${impactColorClass}`}>
            <div className="card-content">
                <h3 className="article-title">{article.title}</h3>
                <div className="article-meta">
                    <span className="article-source">{article.source.name}</span>
                    <span className="article-date">{formattedDate}</span>
                </div>
                <p className="article-description">
                    {isExpanded ? article.description : article.description ? `${article.description.substring(0, 150)}...` : 'No description available.'}
                </p>

                <div className="impact-analysis-box">
                    <div className="impact-header">
                        <span className={`impact-badge ${impactColorClass}`}>
                            {impactLabel}
                        </span>
                        <span className="impact-score">Score: {analysis.impactScore}/10</span>
                    </div>
                    <p className="impact-reason">{analysis.impactDescription}</p>
                    <div className="impact-keywords">
                        <h4>Areas that may be affected:</h4>
                        <div className="keywords-container">
                            {analysis.affectedAreas.map(keyword => (
                                <span key={keyword} className="keyword-tag">{keyword}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card-actions">
                    {article.description && article.description.length > 150 && (
                        <button className="show-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-full-btn">
                        Read Full Article
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NewsArticleCard; 