# Setup Guide

## Environment Variables

Create a `.env` file in your project root with these variables:

```env
# OpenAI API Key (get from https://platform.openai.com/)
OPEN_AI_KEY=sk-your-openai-api-key-here

# GNews API Key (get from https://gnews.io/)
GNEWS_API_KEY=your-gnews-api-key-here

# For local development (optional)
REACT_APP_OPENAI_API_KEY=sk-your-openai-api-key-here
REACT_APP_GNEWS_API_KEY=your-gnews-api-key-here
```

## Netlify Environment Variables

For production deployment, add these in your Netlify dashboard:

1. Go to your site settings in Netlify
2. Navigate to "Environment variables"
3. Add these variables:
   - `OPEN_AI_KEY` = your OpenAI API key
   - `GNEWS_API_KEY` = your GNews API key

## API Key Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### GNews API Key
1. Visit [GNews.io](https://gnews.io/)
2. Sign up for a free account
3. Go to your dashboard
4. Copy your API key

## Testing the Setup

1. Start the development server: `npm start`
2. Open the app in your browser
3. Check the browser console for any API errors
4. If you see "Successfully fetched X real news headlines", you're all set!

## Troubleshooting

### "API key not found" errors
- Double-check your environment variables are set correctly
- For Netlify: Make sure to redeploy after adding environment variables
- For local: Restart your development server after adding `.env` file

### "Unable to fetch real news" errors
- Check your GNews API key is valid
- Verify you haven't exceeded the daily request limit (100 for free tier)
- Check the Netlify function logs for more details

### High OpenAI costs
- The app is configured to limit content to ~1,000 tokens per article
- Consider implementing caching if you're processing many articles 