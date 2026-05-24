import { useEffect, useCallback } from 'react';

/**
 * Modal sebagai side drawer — slide dari kanan.
 * - Tanpa backdrop gelap
 * - Konten tidak terpotong, scroll internal
 * - Tutup dengan Escape atau klik tombol X
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <>
      {/* Overlay tipis — hanya untuk menangkap klik di luar, tidak gelap */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel — slide dari kanan */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          fixed top-0 right-0 z-50 h-full w-full ${widths[size]}
          bg-parchment border-l border-stone-200 shadow-xl
          flex flex-col
          transition-transform duration-250 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0 bg-white">
            <h2 className="font-display text-base font-medium text-ink">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded text-stone-400
                         hover:text-ink hover:bg-stone-100 transition-colors"
              aria-label="Tutup"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable body — tidak terpotong */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </>
  );
}
