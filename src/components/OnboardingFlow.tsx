import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { IMPACT_CATEGORIES } from '../services/categories';
import { updateUserProfile } from '../services/firebase';
import './OnboardingFlow.css';

interface OnboardingFlowProps {
  user: User;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const [availableCategories, setAvailableCategories] = useState<string[]>(Object.keys(IMPACT_CATEGORIES));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddCustomTag = () => {
    const newTag = customTagInput.trim();
    if (newTag && !availableCategories.includes(newTag)) {
      setAvailableCategories(prev => [...prev, newTag]);
      setSelectedCategories(prev => [...prev, newTag]);
      setCustomTagInput('');
    } else if (newTag && !selectedCategories.includes(newTag)) {
      // If the tag already exists but is not selected, select it.
      setSelectedCategories(prev => [...prev, newTag]);
      setCustomTagInput('');
    } else {
      // Clear input if tag is empty or already selected
      setCustomTagInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  const handleFinishOnboarding = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category to continue.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        impactPreferences: {
          categories: selectedCategories,
          urgencyThreshold: 'medium', // Default value
          notifications: true,      // Default value
        },
        hasCompletedOnboarding: true,
      });
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding preferences:", error);
      alert("There was an error saving your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Welcome, {user.displayName || 'Friend'}!</h1>
        <p>Let's personalize your news feed. Select from the topics below, or add your own.</p>
        
        <div className="categories-grid-onboarding">
          {availableCategories.map(category => (
            <button
              key={category}
              className={`category-chip ${selectedCategories.includes(category) ? 'selected' : ''}`}
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="custom-tag-container">
          <input
            type="text"
            className="custom-tag-input"
            placeholder="Add a custom topic and press Enter"
            value={customTagInput}
            onChange={e => setCustomTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="add-tag-button" onClick={handleAddCustomTag}>
            Add
          </button>
        </div>

        <button
          className="finish-button"
          onClick={handleFinishOnboarding}
          disabled={isSaving || selectedCategories.length === 0}
        >
          {isSaving ? 'Saving...' : 'Save and Continue'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow; 