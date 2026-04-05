import { useState, useEffect } from 'react';

const priorities = ['low', 'medium', 'high', 'urgent'];
const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

function sanitize(str) {
  return str.replace(/[<>]/g, '').trim();
}

export default function TaskForm({ isOpen, onClose, onSave, editingTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || '');
        setDueDate(editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : '');
        setPriority(editingTask.priority || 'medium');
        setTagsInput(editingTask.tags?.join(', ') || '');
      } else {
        reset();
      }
      setErrors({});
      setTouched({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (title.trim().length > 200) errs.title = 'Title must be under 200 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setTagsInput('');
    setErrors({});
    setTouched({});
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched({ title: true });
    if (!validate()) return;
    const tags = tagsInput.split(',').map(t => sanitize(t)).filter(Boolean);
    onSave({
      id: editingTask?.id,
      title: sanitize(title),
      description: sanitize(description),
      dueDate: dueDate || null,
      priority,
      tags,
    });
    reset();
  };

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') { reset(); onClose(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-slideIn border border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={() => { reset(); onClose(); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" aria-label="Close dialog">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 transition-colors ${
                errors.title && touched.title
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-gray-200 dark:border-slate-600'
              }`}
              placeholder="What needs to be done?"
              autoFocus
              maxLength={200}
            />
            {errors.title && touched.title && (
              <p id="title-error" className="mt-1 text-xs text-red-500" role="alert">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-none transition-colors"
              placeholder="Add details..."
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <div className="flex gap-1">
                {priorities.map((p) => (
                  <button key={p} type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors ${
                      priority === p
                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-600'
                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {priorityLabels[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <input
              type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-colors"
              placeholder="work, design, urgent (comma separated)"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { reset(); onClose(); }}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2 px-4 rounded-lg bg-violet-500 text-white hover:bg-violet-600 text-sm font-medium shadow-sm transition-colors">
              {editingTask ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
