import axios from 'axios';

const API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export const handler = async (event, context) => {
    try {
        const query = '"Trump administration" OR "Trump policy" OR "executive order"';
        const pageSize = 20;

        const response = await axios.get(NEWS_API_URL, {
            params: {
                q: query,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: pageSize,
                apiKey: API_KEY,
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        console.error('Error fetching news from API:', error);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({
                message: 'Failed to fetch news',
                error: error.message,
            }),
        };
    }
}; 