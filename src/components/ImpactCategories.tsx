import React, { useState, useEffect } from 'react';
import { IMPACT_CATEGORIES } from '../services/categories';
import { updateUserProfile } from '../services/firebase';

interface ImpactCategoriesProps {
  userId: string;
  initialSelectedCategories: string[];
}

const ImpactCategories = ({ userId, initialSelectedCategories }: ImpactCategoriesProps) => {
  const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedCategories(initialSelectedCategories);
  }, [initialSelectedCategories]);

  const handleCategoryChange = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newSelection);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(userId, {
        impactPreferences: {
          categories: selectedCategories,
          urgencyThreshold: 'medium',
          notifications: true
        }
      });
      alert('Your preferences have been saved!');
    } catch (error) {
      alert('Error saving preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="impact-categories-container">
      <h3>Impact Categories</h3>
      <p>Select which areas you want to monitor for personal impact:</p>
      <div className="categories-grid">
        {Object.keys(IMPACT_CATEGORIES).map(category => (
          <div key={category} className="category-item">
            <input
              type="checkbox"
              id={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            <label htmlFor={category}>{category}</label>
          </div>
        ))}
      </div>
      <button onClick={handleSaveChanges} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default ImpactCategories; 