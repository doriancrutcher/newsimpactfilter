# News Impact Filter

A React application that filters Trump administration news to show only articles that directly affect you and your family. This app helps reduce news anxiety by focusing on what actually matters to your personal life.

## Features

- **Smart Filtering**: Uses keyword analysis to identify articles with personal impact
- **Impact Scoring**: Rates articles on a 0-10 scale based on potential personal impact
- **Urgency Levels**: Categorizes impact as low, medium, or high urgency
- **User Authentication**: Firebase-powered sign-up/sign-in system with Google Sign-In
- **Personalized Preferences**: Customize which impact categories to monitor
- **Clean Interface**: Beautiful, responsive design that's easy to use
- **Toggle View**: Switch between showing only impactful articles or all articles

## Personal Impact Categories

The app analyzes articles for impact in these areas:
- **Taxes & Income**: Tax changes, IRS updates, income-related policies
- **Healthcare**: Insurance, Medicare, Medicaid, health regulations
- **Social Security & Retirement**: Pension changes, retirement benefits
- **Education**: Student loans, FAFSA, educational policies
- **Immigration**: Visa changes, citizenship policies
- **Employment**: Job-related policies, unemployment, labor laws
- **Housing**: Mortgage, rent, real estate policies
- **Environment & Energy**: Climate policies, utility costs, energy regulations
- **Transportation**: Gas prices, fuel costs, electric vehicle policies
- **Consumer Protection**: Privacy, consumer rights, small business policies

## Setup Instructions

### 1. Clone and Install

```bash
cd news-impact-filter
npm install
```

### 2. Set Up Firebase (Required for Authentication)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password** authentication
   - Enable **Google** authentication (recommended)
   - For Google auth, click "Enable" and add your authorized domain
4. Set up Firestore Database:
   - Go to Firestore Database
   - Create database in test mode (for development)
5. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll down to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the config values
6. Create a `.env` file in the project root:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 3. Get News API Key (Optional)

For real news data, sign up for a free API key at [NewsAPI.org](https://newsapi.org/):

1. Go to https://newsapi.org/
2. Sign up for a free account
3. Get your API key
4. Add to your `.env` file:

```env
REACT_APP_NEWS_API_KEY=your-news-api-key-here
```

**Note**: The app works with mock data if no API key is provided.

### 4. Run the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## How It Works

### Authentication Flow

1. **Google Sign-In**: Users can sign in with their Google account (recommended)
2. **Email/Password**: Traditional email/password authentication also available
3. **Profile Setup**: Users can customize their impact preferences
4. **Personalized Analysis**: News is filtered based on user preferences
5. **Persistent Settings**: User preferences are saved in Firestore

### Current Implementation (Mock Analysis)

The app currently uses a keyword-based analysis system that:
1. Fetches news articles about Trump administration policies
2. Analyzes article content for personal impact keywords
3. Scores articles based on keyword matches
4. Filters articles with scores of 4+ as "impactful"

### Future Enhancements

To make this even more accurate, you could integrate with:

1. **OpenAI GPT API**: For more sophisticated content analysis
2. **Claude API**: For detailed policy impact assessment
3. **Custom LLM**: Train a model on policy impact data

## API Integration Example

To integrate with a real LLM API, replace the `analyzePersonalImpact` function in `src/services/newsService.ts`:

```typescript
export const analyzePersonalImpact = async (article: NewsArticle): Promise<ImpactAnalysis> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Analyze this news article for personal impact on an average American family. 
        Article: ${article.title} - ${article.description}
        
        Return a JSON response with:
        - hasDirectImpact: boolean
        - impactScore: number (0-10)
        - impactDescription: string
        - affectedAreas: string[]
        - urgency: 'low' | 'medium' | 'high'`
      }]
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

## Customization

### Adding New Impact Categories

Edit the `personalImpactKeywords` array in `src/services/newsService.ts`:

```typescript
const personalImpactKeywords = [
  // ... existing keywords
  'your-new-category', 'related-term'
];
```

### Adjusting Impact Thresholds

Modify the scoring logic in the `analyzePersonalImpact` function:

```typescript
const impactScore = Math.min(foundKeywords.length * 2, 10);
const hasDirectImpact = impactScore >= 4; // Change this threshold
```

## User Features

### Profile Management

- **Custom Categories**: Choose which impact areas to monitor
- **Urgency Settings**: Set sensitivity level (low/medium/high)
- **Notifications**: Toggle notification preferences
- **Account Info**: View and manage account details
- **Google Profile**: Automatic profile picture and name from Google account

### Personalized Experience

- **Saved Preferences**: Your settings are stored securely
- **Impact History**: Track which articles affected you
- **Custom Thresholds**: Adjust what constitutes "impactful" news
- **One-Click Sign-In**: Quick Google authentication

## Technologies Used

- **React 18** with TypeScript
- **Firebase** for authentication and database
- **Google Sign-In** for seamless authentication
- **Axios** for API calls
- **CSS Grid & Flexbox** for responsive design
- **NewsAPI.org** for news data (optional)

## Security

- **Firebase Auth**: Secure email/password and Google authentication
- **Firestore Rules**: Database security rules (configure in Firebase console)
- **Environment Variables**: Sensitive data stored in `.env` file
- **HTTPS**: All Firebase connections are secure
- **OAuth 2.0**: Google Sign-In uses industry-standard OAuth

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this for your own projects.

---

**Note**: This app is designed to help reduce news anxiety by filtering out noise and focusing on what actually affects your life. It's not meant to replace comprehensive news consumption, but rather to provide a more focused, less overwhelming news experience.
# newsimpactfilter
