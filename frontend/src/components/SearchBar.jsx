import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search by name, email, or address...', initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form className="search-bar-form" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          value={searchTerm}
          placeholder={placeholder}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button type="button" className="clear-btn" onClick={handleClear} title="Clear search">
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary search-submit-btn">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
