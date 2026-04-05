export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', confirmClass = 'bg-red-500 hover:bg-red-600' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-slideIn border border-gray-200 dark:border-slate-700 p-6">
        <h2 id="confirm-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} autoFocus
            className="flex-1 py-2 px-4 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded-lg text-white text-sm font-medium shadow-sm transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
