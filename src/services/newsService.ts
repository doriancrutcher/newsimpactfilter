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

// News API service now uses our Netlify function proxy
export const fetchNews = async (keywords: string[]): Promise<NewsArticle[]> => {
  const query = keywords.join(' OR ');
  try {
    const response = await axios.get<NewsResponse>('/.netlify/functions/fetch-news', {
      params: { q: query }
    });
    return response.data.articles || [];
  } catch (error: any) {
    console.error('Error fetching news via proxy:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Proxy responded with:', error.response.status, error.response.data);
      const message = error.response.data?.message || error.message;
      throw new Error(`The news proxy server failed: ${message}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error fetching news: ${error.message}`);
    }
  }
};

// Main function updated to accept keywords
export const getNewsWithImpact = async (keywords: string[]) => {
  // Pass keywords to the fetch function
  const articles = await fetchNews(keywords);
  
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