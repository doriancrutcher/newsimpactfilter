import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { UserProfile as UserProfileType, updateImpactPreferences, signOutUser } from '../services/firebase';

interface UserProfileProps {
  user: User;
  onSignOut: () => void;
}

// Moved outside component to prevent re-creation on every render
const impactCategories = [
    { key: 'tax', label: 'Taxes & Income' },
    { key: 'healthcare', label: 'Healthcare & Insurance' },
    { key: 'social security', label: 'Social Security & Retirement' },
    { key: 'education', label: 'Education & Student Loans' },
    { key: 'immigration', label: 'Immigration' },
    { key: 'employment', label: 'Employment & Jobs' },
    { key: 'housing', label: 'Housing & Real Estate' },
    { key: 'environment', label: 'Environment & Energy' },
    { key: 'transportation', label: 'Transportation & Gas' },
    { key: 'consumer', label: 'Consumer Protection' }
];

const urgencyLevels = [
    { key: 'low', label: 'Low - Only major changes' },
    { key: 'medium', label: 'Medium - Significant changes' },
    { key: 'high', label: 'High - Any relevant changes' }
];

const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // In a real app, you'd fetch the user profile from Firestore
    // For now, we'll use default preferences
    setProfile({
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      impactPreferences: {
        categories: impactCategories.map(cat => cat.key),
        urgencyThreshold: 'medium',
        notifications: true
      },
      createdAt: new Date(),
      lastLogin: new Date()
    });
    setLoading(false);
  }, [user]);

  const handleCategoryToggle = (categoryKey: string) => {
    if (!profile?.impactPreferences) return;

    const currentCategories = profile.impactPreferences.categories;
    const newCategories = currentCategories.includes(categoryKey)
      ? currentCategories.filter(cat => cat !== categoryKey)
      : [...currentCategories, categoryKey];

    setProfile({
      ...profile,
      impactPreferences: {
        ...profile.impactPreferences,
        categories: newCategories
      }
    });
  };

  const handleUrgencyChange = (urgency: 'low' | 'medium' | 'high') => {
    if (!profile?.impactPreferences) return;

    setProfile({
      ...profile,
      impactPreferences: {
        ...profile.impactPreferences,
        urgencyThreshold: urgency
      }
    });
  };

  const handleNotificationsToggle = () => {
    if (!profile?.impactPreferences) return;

    setProfile({
      ...profile,
      impactPreferences: {
        ...profile.impactPreferences,
        notifications: !profile.impactPreferences.notifications
      }
    });
  };

  const handleSave = async () => {
    if (!profile?.impactPreferences) return;

    setSaving(true);
    setMessage('');

    try {
      await updateImpactPreferences(user.uid, profile.impactPreferences);
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Error saving preferences: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onSignOut();
    } catch (error: any) {
      setMessage(`Error signing out: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading profile...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <Link to="/" className="back-button">← Back to Dashboard</Link>
        <div className="profile-avatar">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <h2>Your Profile</h2>
        <p>Customize your news impact preferences</p>
      </div>

      <div className="profile-section">
        <h3>Account Information</h3>
        <div className="account-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.displayName || 'Not set'}</p>
          <p><strong>Member since:</strong> {profile?.createdAt.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Impact Categories</h3>
        <p>Select which areas you want to monitor for personal impact:</p>
        
        <div className="categories-grid">
          {impactCategories.map(category => (
            <label key={category.key} className="category-checkbox">
              <input
                type="checkbox"
                checked={profile?.impactPreferences?.categories.includes(category.key) || false}
                onChange={() => handleCategoryToggle(category.key)}
              />
              <span>{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3>Urgency Threshold</h3>
        <p>How sensitive should the impact detection be?</p>
        
        <div className="urgency-options">
          {urgencyLevels.map(level => (
            <label key={level.key} className="urgency-radio">
              <input
                type="radio"
                name="urgency"
                value={level.key}
                checked={profile?.impactPreferences?.urgencyThreshold === level.key}
                onChange={() => handleUrgencyChange(level.key as 'low' | 'medium' | 'high')}
              />
              <span>{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3>Notifications</h3>
        <label className="notification-toggle">
          <input
            type="checkbox"
            checked={profile?.impactPreferences?.notifications || false}
            onChange={handleNotificationsToggle}
          />
          <span>Receive notifications for high-impact articles</span>
        </label>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="profile-actions">
        <button 
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        
        <button 
          className="signout-button"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile; 