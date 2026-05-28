'use client'

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getPageButtons = () => {
    const buttons = []
    const maxButtons = 7
    let startPage = Math.max(1, currentPage - 3)
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    if (startPage > 1) {
      buttons.push(1)
      if (startPage > 2) buttons.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push('...')
      buttons.push(totalPages)
    }

    return buttons
  }

  if (totalPages <= 1) return null

  const pageButtons = getPageButtons()
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col gap-4 mt-6 p-4 bg-dark-mid/30 rounded-lg border border-dark-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Info */}
        <div className="font-mono text-sm text-gray-400">
          Mostrando <span className="text-amarillo font-bold">{startItem}</span> a{' '}
          <span className="text-amarillo font-bold">{endItem}</span> de{' '}
          <span className="text-amarillo font-bold">{totalItems}</span> registros
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-2 rounded bg-dark-card border border-dark-border text-gray-300 hover:text-amarillo hover:border-amarillo disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="text-xs" />
            <span className="hidden sm:inline text-xs font-mono">Anteriorr</span>
          </button>

          {pageButtons.map((btn, idx) =>
            btn === '...' ? (
              <span key={`dots-${idx}`} className="text-gray-500 px-2">
                …
              </span>
            ) : (
              <button
                key={btn}
                onClick={() => handleGoToPage(btn as number)}
                className={`px-3 py-2 rounded text-xs font-mono transition-colors ${
                  currentPage === btn
                    ? 'bg-amarillo text-black font-bold'
                    : 'bg-dark-card border border-dark-border text-gray-300 hover:text-amarillo hover:border-amarillo'
                }`}
              >
                {btn}
              </button>
            )
          )}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 py-2 rounded bg-dark-card border border-dark-border text-gray-300 hover:text-amarillo hover:border-amarillo disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline text-xs font-mono">Siguiente</span>
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* Page info */}
      <div className="text-center font-mono text-xs text-gray-500">
        Página <span className="text-amarillo font-bold">{currentPage}</span> de{' '}
        <span className="text-amarillo font-bold">{totalPages}</span>
      </div>
    </div>
  )
}
