import React from 'react';

const CATEGORIES = ['All', 'Latest', 'Trending'];

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  return (
    <div className="category-bar-wrapper">
      <div className="category-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
