import { IMPACT_CATEGORIES, ImpactCategory } from './categories';

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
  relevanceScore?: number;
  impactExplanation?: string;
  affectedAreas?: string[];
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

// Expanded pool of headlines for AI simulation
const headlinePool = [
  {
    title: "New Tax Bill Proposes Changes to Standard Deduction",
    description: "The proposed legislation would increase the standard deduction for middle-class families while closing some corporate tax loopholes.",
    content: "A new tax bill introduced in Congress today proposes significant changes to the standard deduction that could affect millions of American families. The bill would increase the standard deduction by $2,000 for single filers and $4,000 for married couples filing jointly.",
    url: "https://example.com/tax-bill-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Financial Times" }
  },
  {
    title: "Healthcare Premiums Expected to Rise 8% Next Year",
    description: "Insurance companies cite increased medical costs and regulatory changes as reasons for the premium hike.",
    content: "Health insurance premiums are projected to increase by an average of 8% next year, according to a new report from the Department of Health and Human Services. This increase affects both individual and employer-sponsored plans.",
    url: "https://example.com/healthcare-premiums-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Health News Daily" }
  },
  {
    title: "Social Security Benefits to Increase by 3.2% in 2024",
    description: "The annual cost-of-living adjustment will provide additional income for millions of retirees.",
    content: "The Social Security Administration announced today that benefits will increase by 3.2% in 2024, providing additional income for over 70 million Americans who receive Social Security benefits.",
    url: "https://example.com/social-security-cola-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Retirement Weekly" }
  },
  {
    title: "Student Loan Forgiveness Program Faces Legal Challenges",
    description: "Multiple lawsuits have been filed against the federal student loan forgiveness program, potentially affecting millions of borrowers.",
    content: "The Biden administration's student loan forgiveness program is facing renewed legal challenges as multiple lawsuits work their way through the federal court system. The outcome could affect millions of student loan borrowers.",
    url: "https://example.com/student-loan-challenges-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Education Today" }
  },
  {
    title: "Federal Reserve Announces Pause on Interest Rate Hikes",
    description: "The central bank will hold interest rates steady, providing relief for borrowers and markets.",
    content: "In a much-anticipated announcement, the Federal Reserve said it will pause its series of interest rate hikes. This decision comes as inflation shows signs of cooling. The move is expected to lower borrowing costs for mortgages, car loans, and credit cards.",
    url: "https://example.com/fed-rate-pause-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Wall Street Journal" }
  },
  {
    title: "New Legislation Aims to Lower Prescription Drug Prices",
    description: "A bipartisan bill would allow Medicare to negotiate prices directly with pharmaceutical companies.",
    content: "A new bill introduced in the Senate aims to tackle the high cost of prescription drugs by empowering Medicare to negotiate prices. If passed, the legislation could significantly lower out-of-pocket costs for seniors.",
    url: "https://example.com/drug-price-bill-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Capitol Hill Reporter" }
  },
  {
    title: "Gig Economy Workers Gain New Protections Under Labor Department Rule",
    description: "A new rule classifies more gig workers as employees rather than independent contractors, granting them more labor rights.",
    content: "The Labor Department finalized a rule that will require companies to treat more of their gig workers as employees. This change could entitle millions of workers for services like Uber and DoorDash to minimum wage, overtime pay, and other benefits.",
    url: "https://example.com/gig-worker-rule-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Labor News Today" }
  },
  {
    title: "Nationwide Infrastructure Project to Create Thousands of Jobs",
    description: "The five-year project will focus on repairing bridges, roads, and public transit systems.",
    content: "The federal government has kicked off a nationwide infrastructure project aimed at modernizing the country's transportation network. The project is expected to create over 50,000 jobs in construction and engineering fields over the next five years.",
    url: "https://example.com/infrastructure-jobs-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Economic Times" }
  },
  {
    title: "Updated EPA Standards Target Industrial Pollution",
    description: "New environmental regulations will require factories to cut emissions of harmful chemicals by 40% over the next decade.",
    content: "The Environmental Protection Agency has issued stricter standards for industrial pollution, requiring manufacturing plants to significantly reduce their emissions. This move is aimed at improving air and water quality in surrounding communities.",
    url: "https://example.com/epa-pollution-standards-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Environmental News" }
  },
  {
    title: "New Consumer Protection Rules Target 'Junk Fees'",
    description: "Federal regulators announced new rules to increase transparency and eliminate hidden fees on tickets, hotel stays, and more.",
    content: "The Federal Trade Commission today announced new consumer protection rules aimed at eliminating 'junk fees.' The regulations will require companies to be more transparent about the total cost of services upfront.",
    url: "https://example.com/junk-fees-rules-2024",
    publishedAt: new Date().toISOString(),
    source: { name: "Tech Privacy News" }
  }
];

// Enhanced function to get real news headlines with relevance scoring
export const getCuratedHeadlines = async (userTags: string[]): Promise<NewsArticle[]> => {
  console.log("Requesting real news headlines from GNews.io...");

  try {
    const response = await fetch('/.netlify/functions/generate-headlines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userTags }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Server error:', errorBody);
      
      // Check if the server suggests using fallback
      if (errorBody.fallback) {
        console.log('Using fallback headlines due to server error');
        return getFallbackHeadlines(userTags);
      }
      
      throw new Error(errorBody.message || `Server error: ${response.status}`);
    }

    const headlines = await response.json();
    
    // Validate the response structure
    if (!Array.isArray(headlines) || headlines.length === 0) {
      console.warn('Server returned empty or invalid response, using fallback');
      return getFallbackHeadlines(userTags);
    }

    console.log(`Successfully fetched ${headlines.length} real news headlines with relevance scores.`);
    return headlines;
  } catch (error) {
    console.error('Error fetching real news headlines:', error);
    console.log('Falling back to predefined headlines');
    return getFallbackHeadlines(userTags);
  }
};

// Enhanced fallback headlines when real news service is unavailable
const getFallbackHeadlines = (userTags: string[]): NewsArticle[] => {
  console.log('Using fallback headlines - these are sample headlines for demonstration');
  
  // Filter the headline pool based on user interests
  const relevantHeadlines = headlinePool.filter(headline => {
    const content = `${headline.title} ${headline.description} ${headline.content}`.toLowerCase();
    return userTags.some(tag => {
      const tagKeywords = IMPACT_CATEGORIES[tag as ImpactCategory] || [tag.toLowerCase()];
      return tagKeywords.some(keyword => content.includes(keyword.toLowerCase()));
    });
  });

  // If we don't have enough relevant headlines, add some general ones
  if (relevantHeadlines.length < 5) {
    const generalHeadlines = headlinePool.filter(headline => 
      !relevantHeadlines.includes(headline)
    ).slice(0, 8 - relevantHeadlines.length);
    
    return [...relevantHeadlines, ...generalHeadlines];
  }

  // Return up to 8 headlines, prioritizing relevant ones
  return relevantHeadlines.slice(0, 8);
};

// Enhanced AI-powered analysis function that works with the new data structure
export const analyzePersonalImpact = async (
  article: NewsArticle, 
  userTags: string[]
): Promise<ImpactAnalysis> => {
  // If the article already has relevance score from GNews analysis, use it
  if ('relevanceScore' in article && typeof article.relevanceScore === 'number') {
    const relevanceScore = article.relevanceScore;
    const impactExplanation = (article as any).impactExplanation || 'Impact analysis available.';
    const affectedAreas = (article as any).affectedAreas || [];
    
    // Determine urgency based on relevance score
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (relevanceScore >= 8) urgency = 'high';
    else if (relevanceScore >= 5) urgency = 'medium';
    
    const hasDirectImpact = relevanceScore >= 4;
    
    return {
      hasDirectImpact,
      impactScore: relevanceScore,
      impactDescription: impactExplanation,
      affectedAreas: affectedAreas,
      urgency
    };
  }

  // Fallback to the original rule-based analysis for fallback headlines
  const relevantKeywords = userTags.flatMap(tag =>
    (IMPACT_CATEGORIES[tag as ImpactCategory] || [tag.toLowerCase()])
  );
  const uniqueKeywords = Array.from(new Set(relevantKeywords));

  // Enhanced rule-based analysis with better scoring
  const content = `${article.title} ${article.description} ${article.content}`.toLowerCase();
  
  // Check for matches with relevant keywords
  const foundKeywords = uniqueKeywords.filter(keyword => 
    content.includes(keyword.toLowerCase())
  );
  
  // Calculate impact score based on keyword matches and content relevance
  let impactScore = 0;
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let affectedAreas: string[] = [];
  
  if (foundKeywords.length > 0) {
    // Base score from keyword matches
    impactScore = Math.min(foundKeywords.length * 2, 6);
    
    // Additional score for specific high-impact keywords
    const highImpactKeywords = [
      'tax', 'healthcare', 'social security', 'student loan', 'mortgage', 
      'insurance', 'premium', 'deduction', 'benefit', 'payment', 'cost',
      'increase', 'decrease', 'change', 'new law', 'regulation', 'policy'
    ];
    const highImpactMatches = highImpactKeywords.filter(keyword => content.includes(keyword));
    impactScore += Math.min(highImpactMatches.length, 4);
    
    // Bonus for urgent keywords
    const urgentKeywords = ['immediate', 'urgent', 'deadline', 'expire', 'effective immediately'];
    const urgentMatches = urgentKeywords.filter(keyword => content.includes(keyword));
    impactScore += urgentMatches.length;
    
    // Cap at 10
    impactScore = Math.min(impactScore, 10);
    
    // Determine urgency
    if (impactScore >= 8 || urgentMatches.length > 0) urgency = 'high';
    else if (impactScore >= 5) urgency = 'medium';
    
    // Map keywords back to user categories
    affectedAreas = userTags.filter(tag => {
      const tagKeywords = IMPACT_CATEGORIES[tag as ImpactCategory] || [tag.toLowerCase()];
      return tagKeywords.some(keyword => foundKeywords.includes(keyword.toLowerCase()));
    });
  }
  
  const hasDirectImpact = impactScore >= 4;
  
  // Generate enhanced impact description
  let impactDescription = 'No direct personal impact detected based on your areas of interest.';
  if (hasDirectImpact) {
    impactDescription = `This news may affect you in these areas: ${affectedAreas.join(', ')}. `;
    if (urgency === 'high') {
      impactDescription += 'This could have significant immediate impact on your finances or daily life. Consider taking action soon.';
    } else if (urgency === 'medium') {
      impactDescription += 'This may affect your financial planning or require your attention in the near future.';
    } else {
      impactDescription += 'This is worth monitoring for potential future impact on your personal situation.';
    }
  }
  
  return {
    hasDirectImpact,
    impactScore,
    impactDescription,
    affectedAreas,
    urgency
  };
};

// Main function that analyzes headlines based on user tags
export const getNewsWithImpact = async (userTags: string[]) => {
  // Get AI-generated headlines
  const articles = await getCuratedHeadlines(userTags);
  
  // If the AI fails, we might get an empty array. Handle it gracefully.
  if (articles.length === 0) {
    return {
      allArticles: [],
      impactfulArticles: [],
      impactCount: 0,
      totalCount: 0,
    };
  }

  // Analyze each article for personal impact
  const articlesWithImpact = await Promise.all(
    articles.map(async (article) => {
      const impact = await analyzePersonalImpact(article, userTags);
      return {
        ...article,
        impact
      };
    })
  );
  
  // Filter for impactful articles
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