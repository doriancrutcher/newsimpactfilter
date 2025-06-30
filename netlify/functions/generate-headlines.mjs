import { OpenAI } from 'openai';
import * as cheerio from 'cheerio';

console.log('[generate-headlines] Function file loaded');

// Real news headline fetcher and analyzer using GNews.io
export const handler = async (event) => {
  console.log('[generate-headlines] ENV DUMP:', JSON.stringify(process.env, null, 2));
  console.log('[generate-headlines] Handler invoked');
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('[generate-headlines] Handling OPTIONS preflight');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Check for the API Keys
  const openaiKey = process.env.OPEN_AI_KEY;
  const gnewsKey = process.env.GNEWS_API_KEY;
  console.log('[generate-headlines] Loaded env keys', { openaiKey: !!openaiKey, gnewsKey: !!gnewsKey });

  if (!openaiKey) {
    console.error('[generate-headlines] OpenAI API Key is missing.');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Server configuration error: OpenAI API key not found.',
        fallback: true 
      }),
    };
  }

  if (!gnewsKey) {
    console.error('[generate-headlines] GNews API Key is missing.');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Server configuration error: GNews API key not found.',
        fallback: true 
      }),
    };
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // Get user topics from the request
  let userTags = [];
  try {
    const body = JSON.parse(event.body || '{}');
    userTags = body.userTags || [];
    console.log('[generate-headlines] Parsed userTags:', userTags);
  } catch (error) {
    console.error('[generate-headlines] Error parsing request body:', error);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Invalid request body.',
        fallback: true 
      }),
    };
  }

  if (!userTags || userTags.length === 0) {
    console.error('[generate-headlines] No user tags provided');
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'No user tags provided.',
        fallback: true 
      }),
    };
  }

  try {
    // Step 1: Fetch real news from GNews.io
    console.log('[generate-headlines] Fetching real news from GNews.io...');
    const realNews = await fetchRealNewsFromGNews(userTags, gnewsKey);
    console.log('[generate-headlines] Fetched real news:', realNews.length, 'articles');
    
    if (!realNews || realNews.length === 0) {
      console.error('[generate-headlines] No real news articles found');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: 'Unable to fetch real news at this time.',
          fallback: true 
        }),
      };
    }

    // Step 2: Extract and analyze articles with AI
    console.log('[generate-headlines] Extracting and analyzing articles...');
    const analyzedNews = await extractAndAnalyzeArticles(realNews, userTags, openai);
    console.log('[generate-headlines] Analyzed news:', analyzedNews.length, 'articles');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyzedNews),
    };

  } catch (error) {
    console.error('[generate-headlines] Error processing news:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Failed to process news data.',
        fallback: true 
      }),
    };
  }
};

// Function to fetch real news from GNews.io
async function fetchRealNewsFromGNews(userTags, apiKey) {
  console.log('[fetchRealNewsFromGNews] Called with userTags:', userTags);
  // Map user tags to GNews search keywords
  const keywordMapping = {
    'Taxes & Income': ['tax', 'irs', 'income tax', 'deduction'],
    'Healthcare & Insurance': ['healthcare', 'insurance', 'medical', 'health policy'],
    'Social Security & Retirement': ['social security', 'retirement', 'pension'],
    'Education & Student Loans': ['student loan', 'education', 'college', 'university'],
    'Immigration': ['immigration', 'border', 'visa', 'immigration policy'],
    'Employment & Jobs': ['employment', 'jobs', 'unemployment', 'labor'],
    'Housing & Real Estate': ['housing', 'real estate', 'mortgage', 'home'],
    'Environment & Energy': ['environment', 'energy', 'climate', 'renewable'],
    'Transportation & Gas': ['transportation', 'gas', 'fuel', 'electric vehicle'],
    'Consumer Protection': ['consumer', 'privacy', 'regulation', 'federal trade commission'],
    'Small Business': ['small business', 'entrepreneur', 'startup']
  };

  // Get relevant keywords for the user's interests
  const relevantKeywords = userTags.flatMap(tag => keywordMapping[tag] || [tag.toLowerCase()]);
  const uniqueKeywords = [...new Set(relevantKeywords)];
  console.log('[fetchRealNewsFromGNews] uniqueKeywords:', uniqueKeywords);

  const allNews = [];

  // Fetch news for each relevant keyword (limit to 3 to avoid rate limits)
  for (const keyword of uniqueKeywords.slice(0, 3)) {
    try {
      console.log(`[fetchRealNewsFromGNews] Fetching for keyword: ${keyword}`);
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword)}&lang=en&country=us&max=5&token=${apiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`[fetchRealNewsFromGNews] Got ${data.articles?.length || 0} articles for keyword: ${keyword}`);
        if (data.articles && data.articles.length > 0) {
          // Filter for recent articles (last 7 days)
          const recentArticles = data.articles.filter(article => {
            const articleDate = new Date(article.publishedAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return articleDate >= weekAgo;
          });
          allNews.push(...recentArticles);
        }
      } else {
        console.error(`[fetchRealNewsFromGNews] Error response for keyword ${keyword}:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`[fetchRealNewsFromGNews] Error fetching for keyword ${keyword}:`, error);
    }
  }

  // Remove duplicates and sort by date
  const uniqueNews = allNews.filter((article, index, self) => 
    index === self.findIndex(a => a.title === article.title)
  );
  console.log('[fetchRealNewsFromGNews] Returning', uniqueNews.length, 'unique articles');

  return uniqueNews
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 12); // Return top 12 most recent articles
}

// Function to extract article content and analyze with AI
async function extractAndAnalyzeArticles(realNews, userTags, openai) {
  console.log('[extractAndAnalyzeArticles] Called with', realNews.length, 'articles');
  const analyzedArticles = [];

  for (const article of realNews) {
    try {
      console.log(`[extractAndAnalyzeArticles] Extracting content for: ${article.title}`);
      // Extract article content using cheerio
      const articleContent = await extractArticleContent(article.url);
      console.log(`[extractAndAnalyzeArticles] Got content length: ${articleContent ? articleContent.length : 0}`);
      
      // Analyze with AI
      const analysis = await analyzeArticleWithAI(article, articleContent, userTags, openai);
      console.log(`[extractAndAnalyzeArticles] Analysis for: ${article.title}`, analysis);
      
      analyzedArticles.push({
        title: article.title,
        description: article.description,
        content: analysis.summary || article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: { name: article.source.name },
        relevanceScore: analysis.relevance_score,
        impactExplanation: analysis.impact_explanation,
        affectedAreas: analysis.affected_areas
      });
    } catch (error) {
      console.error(`[extractAndAnalyzeArticles] Error processing article "${article.title}":`, error);
      // Add article with basic info if extraction fails
      analyzedArticles.push({
        title: article.title,
        description: article.description,
        content: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: { name: article.source.name },
        relevanceScore: 5,
        impactExplanation: "Unable to analyze this article at this time.",
        affectedAreas: []
      });
    }
  }

  console.log('[extractAndAnalyzeArticles] Returning', analyzedArticles.length, 'analyzed articles');
  return analyzedArticles;
}

// Function to extract article content (now using cheerio instead of jsdom + Readability)
async function extractArticleContent(url) {
  console.log('[extractArticleContent] Fetching:', url);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    if (!response.ok) {
      console.error('[extractArticleContent] HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, nav, header, footer, .ad, .advertisement, .sidebar').remove();
    
    // Try to find the main content area
    let content = '';
    
    // Common selectors for article content
    const contentSelectors = [
      'article',
      '.article-content',
      '.post-content', 
      '.entry-content',
      '.content',
      '.story-body',
      '.article-body',
      'main',
      '.main-content'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) {
          console.log(`[extractArticleContent] Found content using selector: ${selector}, length: ${content.length}`);
          break;
        }
      }
    }
    
    // Fallback: get all paragraph text
    if (!content || content.length < 200) {
      content = $('p').map((i, el) => $(el).text().trim()).get().join(' ');
    }
    
    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, ' ')  // Replace newlines with spaces
      .trim();
    
    if (content && content.length > 100) {
      console.log('[extractArticleContent] Extracted content length:', content.length);
      return content.substring(0, 1500); // Limit for token cost
    } else {
      console.warn('[extractArticleContent] Could not extract meaningful content');
      return null;
    }
  } catch (error) {
    console.error('[extractArticleContent] Error extracting content from', url, error);
    return null;
  }
}

// Function to analyze article with AI
async function analyzeArticleWithAI(article, articleContent, userTags, openai) {
  console.log('[analyzeArticleWithAI] Called for:', article.title);
  const prompt = `\nYou are a civic news assistant. You help people understand which news stories affect their daily lives based on policy topics they care about.\n\nA user is interested in the following topics: ${userTags.join(', ')}.\n\nGiven this article, provide:\n1. A relevance score from 1-10 (10 = highly relevant to user's interests)\n2. A 1-sentence explanation of the impact\n3. The top 1-2 issue areas affected\n\nArticle Title: ${article.title}\nArticle Description: ${article.description}\nArticle Content: ${articleContent ? articleContent.substring(0, 1000) : article.description}\n\nRespond in JSON format only:\n{\n  "relevance_score": number,\n  "impact_explanation": "string",\n  "affected_areas": ["string"],\n  "summary": "string (2-3 sentence summary of the article)"\n}\n`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a civic news assistant. You help people understand which news stories affect their daily lives based on policy topics they care about.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;
    console.log('[analyzeArticleWithAI] OpenAI response:', content);
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('[analyzeArticleWithAI] Error parsing AI response:', parseError, content);
      return {
        relevance_score: 5,
        impact_explanation: "Unable to analyze this article at this time.",
        affected_areas: [],
        summary: article.description
      };
    }
  } catch (error) {
    console.error('[analyzeArticleWithAI] Error calling OpenAI API:', error);
    return {
      relevance_score: 5,
      impact_explanation: "Unable to analyze this article at this time.",
      affected_areas: [],
      summary: article.description
    };
  }
} 