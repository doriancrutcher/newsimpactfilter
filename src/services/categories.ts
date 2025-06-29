export const IMPACT_CATEGORIES = {
  'Taxes & Income': ['tax', 'taxes', 'taxation', 'irs', 'income', 'deduction', 'refund', 'filing'],
  'Healthcare & Insurance': ['healthcare', 'health', 'insurance', 'medicare', 'medicaid', 'premium', 'coverage', 'medical'],
  'Social Security & Retirement': ['social security', 'retirement', 'pension', 'ssi', 'benefits', 'senior'],
  'Education & Student Loans': ['education', 'student loans', 'fafsa', 'college', 'university', 'tuition', 'financial aid'],
  'Immigration': ['immigration', 'visa', 'citizenship', 'green card', 'border', 'deportation'],
  'Employment & Jobs': ['employment', 'jobs', 'unemployment', 'labor', 'workplace', 'salary', 'hiring'],
  'Housing & Real Estate': ['housing', 'mortgage', 'rent', 'real estate', 'property', 'home', 'apartment'],
  'Environment & Energy': ['environment', 'climate', 'energy', 'utilities', 'renewable', 'pollution', 'green'],
  'Transportation & Gas': ['transportation', 'gas', 'fuel', 'electric vehicles', 'commute', 'public transit'],
  'Consumer Protection': ['consumer', 'consumer protection', 'privacy', 'fraud', 'scam', 'rights'],
  'Small Business': ['small business', 'entrepreneur', 'startup', 'self-employed', 'contractor', 'gig economy']
};

export type ImpactCategory = keyof typeof IMPACT_CATEGORIES;

export const getAllKeywords = (): string[] => {
  return Object.values(IMPACT_CATEGORIES).flat();
};

// Function to get keywords for specific categories
export const getKeywordsForCategories = (categories: string[]): string[] => {
  return categories.flatMap(category => 
    IMPACT_CATEGORIES[category as ImpactCategory] || []
  );
};

// Function to get category name from keyword
export const getCategoryFromKeyword = (keyword: string): string | null => {
  for (const [category, keywords] of Object.entries(IMPACT_CATEGORIES)) {
    if (keywords.includes(keyword.toLowerCase())) {
      return category;
    }
  }
  return null;
}; 