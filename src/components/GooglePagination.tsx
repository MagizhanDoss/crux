/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface GooglePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const GooglePagination: React.FC<GooglePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems <= 0) return null;

  // Determine window of page numbers to show (max 10 like Google)
  const maxVisible = 10;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Google colors for the 'o' sequence
  const googleColors = ['#EA4335', '#FBBC05', '#34A853', '#4285F4'];

  return (
    <div className="mt-10 pt-8 pb-4 border-t border-[var(--border-subtle)] flex flex-col items-center justify-center space-y-6">
      {/* Google-Style Iconic Brand Logo Pagination */}
      <div className="flex flex-col items-center select-none" aria-label="Pagination Navigation">
        {/* Top Letters Row */}
        <div className="flex items-end justify-center font-serif text-3xl sm:text-4xl tracking-tight h-12">
          {/* Initial 'G' */}
          <span className="font-bold text-[#4285F4] pr-0.5">G</span>

          {/* Repeating 'o's for each visible page */}
          {pageNumbers.map((p, idx) => {
            const isCurrent = p === currentPage;
            const color = isCurrent ? '#EA4335' : googleColors[idx % googleColors.length];
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className="group flex flex-col items-center cursor-pointer px-1 sm:px-1.5 focus:outline-none transition-transform hover:scale-110"
                title={`Go to page ${p}`}
                aria-label={`Go to page ${p}`}
              >
                <span
                  className={`transition-all font-bold ${
                    isCurrent
                      ? 'text-3xl sm:text-4xl scale-125'
                      : 'text-2xl sm:text-3xl opacity-80 group-hover:opacity-100'
                  }`}
                  style={{ color }}
                >
                  o
                </span>
              </button>
            );
          })}

          {/* Suffix letters 'g', 'l', 'e' */}
          <span className="font-bold text-[#4285F4]">g</span>
          <span className="font-bold text-[#34A853]">l</span>
          <span className="font-bold text-[#EA4335]">e</span>
        </div>

        {/* Page Number Labels & Previous/Next Buttons */}
        <nav
          className="flex items-center justify-center gap-1 sm:gap-2 mt-2 font-mono text-xs"
          aria-label="Pagination Controls"
        >
          {/* Previous Page Button */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer ${
              currentPage <= 1
                ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
                : 'text-[#4285F4] hover:bg-[#4285F4]/10 hover:underline'
            }`}
            aria-label="Previous page"
          >
            <span aria-hidden="true">&lt;</span>
            <span>Previous</span>
          </button>

          {/* Numerical Page Buttons */}
          <div className="flex items-center gap-1">
            {startPage > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => onPageChange(1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    currentPage === 1
                      ? 'bg-[var(--accent-teal)] text-white shadow-sm'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-inner)]'
                  }`}
                >
                  1
                </button>
                {startPage > 2 && <span className="text-[var(--text-muted)] px-1">...</span>}
              </>
            )}

            {pageNumbers.map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-[#4285F4] text-white shadow-md font-bold scale-110'
                      : 'text-[#4285F4] hover:bg-[var(--bg-inner)] hover:underline'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="text-[var(--text-muted)] px-1">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    currentPage === totalPages
                      ? 'bg-[var(--accent-teal)] text-white shadow-sm'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-inner)]'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next Page Button (Google Style) */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer ${
              currentPage >= totalPages
                ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
                : 'text-[#4285F4] hover:bg-[#4285F4]/10 hover:underline'
            }`}
            aria-label="Next page"
          >
            <span>Next</span>
            <span aria-hidden="true">&gt;</span>
          </button>
        </nav>
      </div>

      {/* Meta Footer & Page Size Selector */}
      <div className="flex items-center justify-between w-full max-w-2xl px-4 text-xs text-[var(--text-muted)] flex-wrap gap-3 font-mono">
        <div>
          Showing <span className="font-semibold text-[var(--text-heading)]">{startIndex + 1}</span>–
          <span className="font-semibold text-[var(--text-heading)]">{endIndex}</span> of{' '}
          <span className="font-semibold text-[var(--text-heading)]">{totalItems}</span> statements (Page{' '}
          <span className="text-[var(--accent-teal)] font-bold">{currentPage}</span> of {totalPages})
        </div>

        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="py-1 px-2 text-xs rounded bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors cursor-pointer"
          >
            <option value={9}>9</option>
            <option value={12}>12 (Recommended)</option>
            <option value={18}>18</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={-1}>All ({totalItems})</option>
          </select>
        </div>
      </div>
    </div>
  );
};
