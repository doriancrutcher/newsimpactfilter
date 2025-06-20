import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import './App.css';
import { getNewsWithImpact, NewsArticle, ImpactAnalysis } from './services/newsService';
import { onAuthStateChange, signOutUser, getUserProfile, updateUserProfile } from './services/firebase';
import NewsImpactDashboard from './components/NewsImpactDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';
import FilterManager from './components/FilterManager';
import { getAuth } from 'firebase/auth';
import Modal from './components/Modal';

interface NewsData {
  allArticles: (NewsArticle & { impact: ImpactAnalysis })[];
  impactfulArticles: (NewsArticle & { impact: ImpactAnalysis })[];
  impactCount: number;
  totalCount: number;
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

const DAILY_ANALYZE_LIMIT = 3;

// Layout for all authenticated pages
const Layout: React.FC<{ user: User; onSignOut: () => void }> = ({ user, onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await onSignOut();
    navigate('/auth');
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="app-title">NewsImpactFilter</Link>
          <div className="user-info">
            <img src={user.photoURL || 'default-avatar.png'} alt={user.displayName || 'User'} className="user-avatar" />
            <span>Welcome, {user.displayName || user.email}</span>
            <Link to="/profile" className="profile-btn">Profile</Link>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

// The dashboard page that fetches and displays news
const DashboardPage: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>(defaultPersonalImpactKeywords);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [lastAnalysisDate, setLastAnalysisDate] = useState('');
  const [canAnalyze, setCanAnalyze] = useState(true);
  const authUser = getAuth().currentUser;
  const [showAllStories, setShowAllStories] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check and update user's analysis limit on component mount
  useEffect(() => {
    const checkUserLimit = async () => {
      if (!authUser) return;

      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastDate = userProfile.lastAnalysisDate || '';
        let currentCount = userProfile.analysisCount || 0;

        if (today !== lastDate) {
          // It's a new day, reset the count
          currentCount = 0;
          await updateUserProfile(authUser.uid, { analysisCount: 0, lastAnalysisDate: today });
        }
        
        setAnalysisCount(currentCount);
        setLastAnalysisDate(today);
        setCanAnalyze(currentCount < DAILY_ANALYZE_LIMIT);
      }
    };
    checkUserLimit();
  }, [authUser]);

  const handleFetchNews = useCallback(async (force = false) => {
    if (!canAnalyze && !force) {
      setError(`You have reached your daily analysis limit of ${DAILY_ANALYZE_LIMIT}.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getNewsWithImpact(keywords);
      setNewsData(data);

      // Increment analysis count after a successful fetch
      if (authUser) {
        const newCount = analysisCount + 1;
        setAnalysisCount(newCount);
        setCanAnalyze(newCount < DAILY_ANALYZE_LIMIT);
        await updateUserProfile(authUser.uid, { analysisCount: newCount, lastAnalysisDate });
      }

    } catch (err) {
      setError('Failed to fetch news data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keywords, authUser, canAnalyze, analysisCount, lastAnalysisDate]);

  // Initial fetch on component load (should not count against limit)
  useEffect(() => {
    const initialFetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getNewsWithImpact([
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
            ]);
            setNewsData(data);
        } catch (err) {
            setError('Failed to fetch news data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    initialFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []); // Run only once on initial mount

  const handleAnalyze = () => {
    handleFetchNews();
  };

  const handleShowAllClick = () => {
    if (newsData && newsData.impactCount === 0 && !showAllStories) {
      setIsModalOpen(true);
    } else {
      setShowAllStories(!showAllStories);
    }
  };

  const handleShowAllFromModal = () => {
    setShowAllStories(true);
    setIsModalOpen(false);
  };

  return (
    <div>
      <FilterManager
        keywords={keywords}
        onKeywordsChange={setKeywords}
        defaultKeywords={defaultPersonalImpactKeywords}
        onAnalyze={handleAnalyze}
        isAnalyzing={loading}
      />
      {error && !loading && (
        <div className="error-container" style={{textAlign: 'center', padding: '20px', color: '#c0392b'}}>
            {error}
        </div>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : newsData ? (
        <>
          <NewsImpactDashboard newsData={newsData} showAll={showAllStories} />
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button onClick={handleShowAllClick} className="show-all-btn">
              {showAllStories ? 'Show Only Impactful Stories' : 'Show All Stories'}
            </button>
          </div>
        </>
      ) : null}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="friendly-modal-content">
            <h3>We've reviewed the latest news for you.</h3>
            <p>Based on your current filters, we couldn't find any stories that seem to have a direct impact on you. You can either adjust your filters or view all the stories we analyzed.</p>
            <button onClick={handleShowAllFromModal} className="modal-action-btn">
                Show All Stories Anyway
            </button>
        </div>
      </Modal>
    </div>
  );
};

// The authentication page
const AuthPage: React.FC = () => (
  <div className="auth-page">
    <div className="auth-header">
      <h1>News Impact Filter</h1>
      <p>Sign in to access your personalized news dashboard.</p>
    </div>
    <AuthForm onAuthSuccess={() => {}} />
  </div>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/*" element={user ? <Layout user={user} onSignOut={signOutUser} /> : <Navigate to="/auth" />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<UserProfile user={user!} onSignOut={signOutUser} />} />
        </Route>
    </Routes>
  );
}

export default App;
