import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FilterManagerProps {
    keywords: string[];
    onKeywordsChange: (newKeywords: string[]) => void;
    defaultKeywords: string[];
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

const FilterManager: React.FC<FilterManagerProps> = ({ keywords, onKeywordsChange, defaultKeywords, onAnalyze, isAnalyzing }) => {
    const [newKeyword, setNewKeyword] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAddKeyword = () => {
        if (newKeyword && !keywords.includes(newKeyword.toLowerCase())) {
            onKeywordsChange([...keywords, newKeyword.toLowerCase()]);
        }
        setNewKeyword('');
        setIsAdding(false);
    };

    const handleRemoveKeyword = (keywordToRemove: string) => {
        onKeywordsChange(keywords.filter(k => k !== keywordToRemove));
    };
    
    const handleResetToDefault = () => {
        onKeywordsChange(defaultKeywords);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddKeyword();
        }
    };

    return (
        <div className="filter-manager">
            <div className="filter-manager-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h3>Your Impact Filters</h3>
                <button className={`toggle-btn ${isExpanded ? 'expanded' : ''}`}>
                    {isExpanded ? 'Collapse' : 'Expand'}
                </button>
            </div>
            {isExpanded && (
                <div className="filter-manager-content">
                    <p>Add or remove keywords, then click Analyze to refresh your feed.</p>
                    <div className="filter-tags">
                        {keywords.map(keyword => (
                            <div key={keyword} className="filter-tag">
                                <span>{keyword}</span>
                                <button onClick={() => handleRemoveKeyword(keyword)}>×</button>
                            </div>
                        ))}
                        {isAdding ? (
                            <input
                                type="text"
                                className="keyword-input"
                                value={newKeyword}
                                onChange={e => setNewKeyword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onBlur={handleAddKeyword}
                                autoFocus
                            />
                        ) : (
                            <button className="add-keyword-btn" onClick={() => setIsAdding(true)}>+</button>
                        )}
                    </div>
                    <div className="filter-actions">
                        <button className="analyze-button" onClick={onAnalyze} disabled={isAnalyzing}>
                            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                        <div className="actions-right">
                            <button className="default-btn" onClick={handleResetToDefault}>Reset to Default</button>
                            <Link to="/profile" className="more-settings-link">More Settings →</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterManager; 