// Simple test script to verify API keys are working
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testGNewsAPI() {
  console.log('Testing GNews API...');
  
  // Check for the correct environment variable name
  const gnewsKey = process.env.GNEWS_API_KEY || process.env.GNEWS_API_Key;
  
  if (!gnewsKey) {
    console.log('❌ GNEWS_API_KEY not found in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('GNEWS')));
    return;
  }
  
  console.log('Found GNews API key:', gnewsKey.substring(0, 10) + '...');
  
  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=tax&lang=en&country=us&max=2&token=${gnewsKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GNews API working!');
      console.log(`Found ${data.articles?.length || 0} articles`);
      if (data.articles && data.articles.length > 0) {
        console.log('Sample article:', data.articles[0].title);
      }
    } else {
      console.log('❌ GNews API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ GNews API error:', error.message);
  }
}

async function testOpenAIAPI() {
  console.log('\nTesting OpenAI API...');
  
  const openaiKey = process.env.OPEN_AI_KEY;
  
  if (!openaiKey) {
    console.log('❌ OPEN_AI_KEY not found in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('OPEN')));
    return;
  }
  
  console.log('Found OpenAI API key:', openaiKey.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ OpenAI API working!');
    } else {
      console.log('❌ OpenAI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ OpenAI API error:', error.message);
  }
}

async function runTests() {
  console.log('🔍 Testing API Keys...\n');
  
  await testGNewsAPI();
  await testOpenAIAPI();
  
  console.log('\n📝 Next steps:');
  console.log('1. If both APIs are working, your keys are set up correctly!');
  console.log('2. Open http://localhost:8888 in your browser');
  console.log('3. The app should now fetch real news and analyze it');
}

runTests().catch(console.error); 