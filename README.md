# News Impact Filter

A React application that fetches real news headlines from GNews.io and uses AI to analyze their personal impact based on user interests.

## Features

- **Real News Headlines**: Fetches current news from GNews.io API
- **AI-Powered Analysis**: Uses OpenAI to analyze how news affects personal interests
- **Relevance Scoring**: Rates news relevance on a 1-10 scale with detailed impact explanations
- **Article Content Extraction**: Extracts and analyzes full article content for better accuracy
- **Personal Impact Assessment**: Identifies which specific areas of your life are affected
- **User Interest Filtering**: Customizable categories of personal interest
- **Fallback System**: Graceful degradation when external services are unavailable

## Setup

### 1. Get API Keys

You'll need two API keys:

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

#### GNews API Key
1. Go to [GNews.io](https://gnews.io/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Copy the key

### 2. Configure Environment Variables

For Netlify deployment, add these environment variables in your Netlify dashboard:
- `OPEN_AI_KEY` (your OpenAI API key)
- `GNEWS_API_KEY` (your GNews API key)

For local development, create a `.env` file in your project root:
```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_GNEWS_API_KEY=your_gnews_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm start
```

The app will run on `http://localhost:8888`

## How It Works

1. **News Fetching**: The app fetches real news headlines from GNews.io based on your selected interest categories
2. **Content Extraction**: Extracts full article content from the news URLs for better analysis
3. **AI Analysis**: OpenAI analyzes each article to determine personal impact and relevance
4. **Relevance Scoring**: Each news item gets a relevance score (1-10) with detailed impact explanation
5. **Impact Assessment**: Identifies which specific areas of your life are affected by each story

## Interest Categories

The app supports these categories:
- Taxes & Income
- Healthcare & Insurance
- Social Security & Retirement
- Education & Student Loans
- Immigration
- Employment & Jobs
- Housing & Real Estate
- Environment & Energy
- Transportation & Gas
- Consumer Protection
- Small Business

## API Limits

- **GNews.io**: Free tier allows 100 requests per day
- **OpenAI**: Usage depends on your OpenAI plan (GPT-4-turbo is used for analysis)

## Legal & Ethical Considerations

- **Content Extraction**: Only extracts content from public articles that don't require login
- **Attribution**: Always links back to original sources and attributes content properly
- **Rate Limiting**: Respects API rate limits and implements proper delays
- **No Storage**: Article content is processed once and not stored permanently

## Troubleshooting

### No News Appearing
- Check that your API keys are correctly set in Netlify environment variables
- Verify your GNews.io API key is active and has remaining requests
- Check the browser console for error messages

### Fallback Mode
If the real news service is unavailable, the app will show sample headlines for demonstration purposes.

### High OpenAI Costs
- The app limits article content to ~1,000 tokens to control costs
- Consider implementing caching to avoid re-analyzing the same articles

## Deployment

The app is configured for Netlify deployment with serverless functions for API calls.

## Contributing

Feel free to submit issues and enhancement requests! # newsimpactfilter
