'use client';

import { PaginationData } from '@/types/api';

interface PaginationProps {
  pagination?: PaginationData | null;
  totalPages?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }
  return pages;
}

export default function Pagination({ pagination, totalPages: totalPagesProp, currentPage, onPageChange }: PaginationProps) {
  const totalPages = totalPagesProp || pagination?.pages || 0;
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-dungeon-surface border border-dungeon-outline rounded-lg text-dungeon-header-text disabled:opacity-50 disabled:cursor-not-allowed hover:border-dungeon-accent transition-colors"
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`w-10 h-10 rounded-lg border transition-colors ${
              page === currentPage
                ? 'bg-dungeon-accent border-dungeon-accent text-dungeon-dark-text font-bold'
                : page === '...'
                ? 'bg-transparent border-transparent text-dungeon-secondary cursor-default'
                : 'bg-dungeon-surface border-dungeon-outline text-dungeon-header-text hover:border-dungeon-accent'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-dungeon-surface border border-dungeon-outline rounded-lg text-dungeon-header-text disabled:opacity-50 disabled:cursor-not-allowed hover:border-dungeon-accent transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
