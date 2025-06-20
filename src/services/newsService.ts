import axios from 'axios';

// Types for our news data
export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export interface ImpactAnalysis {
  hasDirectImpact: boolean;
  impactScore: number; // 0-10 scale
  impactDescription: string;
  affectedAreas: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

// Default keywords, can be overridden by user preferences
const defaultPersonalImpactKeywords = [
    'tax', 'taxes', 'taxation', 'irs', 'income',
    'healthcare', 'health', 'insurance', 'medicare', 'medicaid',
    'social security', 'retirement', 'pension',
    'education', 'student loans', 'fafsa',
    'immigration', 'visa', 'citizenship',
    'employment', 'jobs', 'unemployment', 'labor',
    'housing', 'mortgage', 'rent', 'real estate',
    'environment', 'climate', 'energy', 'utilities',
    'transportation', 'gas', 'fuel', 'electric vehicles',
    'consumer', 'consumer protection', 'privacy',
    'small business', 'entrepreneur', 'startup'
];

// Updated analysis function to accept keywords
export const analyzePersonalImpact = async (
  article: NewsArticle, 
  keywords: string[] = defaultPersonalImpactKeywords
): Promise<ImpactAnalysis> => {
  const content = `${article.title} ${article.description}`.toLowerCase();
  
  const foundKeywords = keywords.filter(keyword => 
    content.includes(keyword.toLowerCase())
  );
  
  const impactScore = Math.min(foundKeywords.length * 2, 10);
  const hasDirectImpact = impactScore >= 4;
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (impactScore >= 7) urgency = 'high';
  else if (impactScore >= 4) urgency = 'medium';
  
  return {
    hasDirectImpact,
    impactScore,
    impactDescription: hasDirectImpact 
      ? `This policy may affect topics you're monitoring: ${foundKeywords.join(', ')}`
      : 'No direct personal impact detected based on your filters.',
    affectedAreas: foundKeywords,
    urgency
  };
};

// News API service (using NewsAPI.org - you'll need to get a free API key)
export const fetchTrumpAdminNews = async (): Promise<NewsArticle[]> => {
  try {
    // You'll need to sign up for a free API key at https://newsapi.org/
    const API_KEY = process.env.REACT_APP_NEWS_API_KEY || 'your-api-key-here';
    
    const response = await axios.get<NewsResponse>(
      `https://newsapi.org/v2/everything?q="Trump administration" OR "Trump policy" OR "executive order"&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`
    );
    
    return response.data.articles || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Return mock data for development
    return [
      {
        title: "Trump Administration Proposes New Tax Changes",
        description: "The administration is considering changes to income tax brackets that could affect middle-class families.",
        content: "The Trump administration has proposed new tax legislation that would modify income tax brackets...",
        url: "https://example.com/tax-changes",
        publishedAt: new Date().toISOString(),
        source: { name: "Mock News" }
      },
      {
        title: "Healthcare Policy Updates Announced",
        description: "New healthcare regulations could impact insurance coverage for millions of Americans.",
        content: "The Department of Health and Human Services announced new healthcare regulations...",
        url: "https://example.com/healthcare-updates",
        publishedAt: new Date().toISOString(),
        source: { name: "Mock News" }
      },
      {
        title: "Foreign Policy Statement Released",
        description: "The administration released a statement regarding international trade relations.",
        content: "A new foreign policy statement was released today regarding trade relations...",
        url: "https://example.com/foreign-policy",
        publishedAt: new Date().toISOString(),
        source: { name: "Mock News" }
      }
    ];
  }
};

// Main function updated to accept keywords
export const getNewsWithImpact = async (keywords: string[]) => {
  const articles = await fetchTrumpAdminNews();
  
  const articlesWithImpact = await Promise.all(
    articles.map(async (article) => {
      const impact = await analyzePersonalImpact(article, keywords);
      return {
        ...article,
        impact
      };
    })
  );
  
  const impactfulArticles = articlesWithImpact.filter(article => 
    article.impact.hasDirectImpact
  );
  
  return {
    allArticles: articlesWithImpact,
    impactfulArticles,
    impactCount: impactfulArticles.length,
    totalCount: articlesWithImpact.length
  };
}; 