import React from 'react';

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container">
      <span className="pagination-info">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total records)
      </span>

      <div className="pagination-controls">
        <button
          className="btn btn-outline btn-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &laquo; Previous
        </button>

        <div className="pagination-numbers">
          {pages.map((p) => (
            <button
              key={p}
              className={`page-number-btn ${currentPage === p ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          className="btn btn-outline btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
