import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import './App.css';
import { getNewsWithImpact, NewsArticle, ImpactAnalysis } from './services/newsService';
import { onAuthStateChange, signOutUser, getUserProfile } from './services/firebase';
import NewsImpactDashboard from './components/NewsImpactDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';
import FilterManager from './components/FilterManager';
import { getAuth } from 'firebase/auth';
import Modal from './components/Modal';
import OnboardingFlow from './components/OnboardingFlow';

interface NewsData {
  allArticles: (NewsArticle & { impact: ImpactAnalysis })[];
  impactfulArticles: (NewsArticle & { impact: ImpactAnalysis })[];
  impactCount: number;
  totalCount: number;
}

// Default user tags for new users
const defaultUserTags = [
    'Taxes & Income',
    'Healthcare & Insurance', 
    'Social Security & Retirement',
    'Education & Student Loans',
    'Immigration',
    'Employment & Jobs',
    'Housing & Real Estate',
    'Environment & Energy',
    'Transportation & Gas',
    'Consumer Protection',
    'Small Business'
];

// Layout for all authenticated pages
const Layout = ({ user, onSignOut }: { user: User; onSignOut: () => void }) => {
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
const DashboardPage = () => {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTags, setUserTags] = useState<string[]>(defaultUserTags);
  const authUser = getAuth().currentUser;
  const [showAllStories, setShowAllStories] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check and update user's analysis limit on component mount
  useEffect(() => {
    const checkUserOnboarding = async () => {
      if (!authUser) return;

      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile) {
        // Onboarding Check
        if (!userProfile.hasCompletedOnboarding) {
          setNeedsOnboarding(true);
          setLoading(false);
          return;
        }
        
        // Set user tags from profile if available
        if (userProfile.impactPreferences?.categories) {
          setUserTags(userProfile.impactPreferences.categories);
        }
      }
      // If no profile, maybe they need onboarding, but let's assume not for now to avoid loops
      // This case should be handled by the onboarding flow creating the profile correctly.
      setLoading(false);
    };
    checkUserOnboarding();
  }, [authUser]);

  const handleFetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNewsWithImpact(userTags);
      setNewsData(data);

    } catch (err) {
      setError('Failed to analyze news data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userTags]);

  // Initial fetch on component load
  useEffect(() => {
    handleFetchNews();
  }, [handleFetchNews]);

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

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    // Re-fetch user profile and news data
    const reloadData = async () => {
      if (!authUser) return;
      setLoading(true);
      const userProfile = await getUserProfile(authUser.uid);
      if (userProfile && userProfile.impactPreferences?.categories) {
        setUserTags(userProfile.impactPreferences.categories);
      }
      setLoading(false);
    };
    reloadData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (needsOnboarding) {
    return <OnboardingFlow user={authUser!} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div>
      <FilterManager
        keywords={userTags}
        onKeywordsChange={setUserTags}
        defaultKeywords={defaultUserTags}
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
const AuthPage = () => (
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
