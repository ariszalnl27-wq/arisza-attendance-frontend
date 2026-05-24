import { useEffect, useCallback } from 'react'

/**
 * Modal yang benar-benar menutupi seluruh viewport.
 * Backdrop dan scroll container disatukan agar background selalu rata
 * meski konten panjang dan perlu di-scroll.
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, handleKey])

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-xl', xl: 'max-w-3xl' }

  return (
    /* Satu div: backdrop + scroll container — background selalu full screen */
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-start justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Panel — terpusat vertikal dengan my-auto */}
      <div
        className={`
          relative w-full ${sizes[size]} my-auto
          bg-white rounded-lg shadow-2xl border border-stone-200
          flex flex-col
          animate-in fade-in zoom-in-95 duration-150
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
            <h2 className="font-display text-base font-medium text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded text-stone-400
                         hover:text-ink hover:bg-stone-100 transition-colors"
              aria-label="Tutup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
