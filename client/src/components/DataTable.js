import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiDownload, FiSearch, FiFilter } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';
import './DataTable.css';

const DataTable = ({ 
  data, 
  columns, 
  title,
  onRowClick,
  searchFields = [],
  exportFileName = 'data'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const { colors } = useTheme();

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = typeof field === 'function' ? field(item) : item[field];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = aVal.toString().toLowerCase();
        const bStr = bVal.toString().toLowerCase();
        
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, searchFields]);

  const handleExport = (format) => {
    const exportData = filteredAndSortedData.map(item => {
      const row = {};
      columns.forEach(col => {
        if (col.key && item[col.key] !== undefined) {
          row[col.label || col.key] = item[col.key];
        } else if (col.render) {
          row[col.label] = typeof col.render === 'function' ? col.render(item) : '';
        }
      });
      return row;
    });

    if (format === 'excel') {
      exportToExcel(exportData, exportFileName);
    } else {
      exportToCSV(exportData, exportFileName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="data-table-container"
      style={{
        backgroundColor: colors.surface,
        color: colors.text,
        borderColor: colors.border
      }}
    >
      <div className="data-table-header" style={{ borderBottomColor: colors.border }}>
        <h3>{title}</h3>
        <div className="data-table-actions">
          {searchFields.length > 0 && (
            <div className="search-container">
              <FiSearch className="search-icon" style={{ color: colors.textSecondary }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                  backgroundColor: colors.surfaceLight,
                  color: colors.text,
                  borderColor: colors.border
                }}
              />
            </div>
          )}
          <div className="export-buttons">
            <button
              onClick={() => handleExport('excel')}
              className="export-button"
              style={{
                backgroundColor: colors.primary,
                color: '#fff'
              }}
              title="Export to Excel"
            >
              <FiDownload /> Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="export-button"
              style={{
                backgroundColor: colors.primary,
                color: '#fff'
              }}
              title="Export to CSV"
            >
              <FiDownload /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr style={{ borderBottomColor: colors.border }}>
              {columns.map((column) => (
                <th
                  key={column.key || column.label}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={column.sortable !== false ? 'sortable' : ''}
                  style={{
                    backgroundColor: colors.surfaceLight,
                    color: colors.text,
                    borderRightColor: colors.border
                  }}
                >
                  <div className="th-content">
                    {column.label}
                    {column.sortable !== false && (
                      <span className="sort-indicator">
                        {sortConfig.key === column.key && (
                          sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state" style={{ color: colors.textSecondary }}>
                  No data found
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row, index) => (
                <motion.tr
                  key={row._id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                  style={{
                    borderBottomColor: colors.border,
                    backgroundColor: index % 2 === 0 ? colors.surface : colors.surfaceLight
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key || column.label}
                      style={{
                        color: colors.text,
                        borderRightColor: colors.border
                      }}
                    >
                      {column.render ? column.render(row) : (row[column.key] ?? '—')}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table-footer" style={{ borderTopColor: colors.border, color: colors.textSecondary }}>
        Showing {filteredAndSortedData.length} of {data.length} entries
      </div>
    </motion.div>
  );
};

export default DataTable;


