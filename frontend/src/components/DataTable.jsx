import React from 'react';

const DataTable = ({
  columns,
  data = [],
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = 'No records found matching your criteria.'
}) => {
  return (
    <div className="table-responsive-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortBy === col.key;
              const isSortable = col.sortable !== false && onSort;

              return (
                <th
                  key={col.key}
                  className={isSortable ? 'sortable-th' : ''}
                  onClick={() => isSortable && onSort(col.key)}
                >
                  <div className="th-content">
                    <span>{col.label}</span>
                    {isSortable && (
                      <span className="sort-indicator">
                        {isSorted ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-table-cell">
                <div className="empty-state">
                  <span className="empty-icon">📂</span>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key] || '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
