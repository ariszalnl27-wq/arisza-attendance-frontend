import Modal from './Modal'
import Spinner from './Spinner'

export default function ConfirmDialog({ open, onClose, onConfirm, loading, title, message, confirmLabel = 'Konfirmasi', variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-stone-600 mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Batal</button>
        <button
          className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <Spinner size={14} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
