import { useState, useEffect } from 'react';

const priorities = ['low', 'medium', 'high', 'urgent'];
const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

export default function TaskForm({ isOpen, onClose, onSave, editingTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : '');
      setPriority(editingTask.priority || 'medium');
      setTagsInput(editingTask.tags?.join(', ') || '');
    }
  }, [editingTask]);

  const reset = () => {
    setTitle(''); setDescription(''); setDueDate(''); setPriority('medium'); setTagsInput('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      id: editingTask?.id,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority,
      tags,
    });
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 animate-fadeIn" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-slideIn border border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={() => { reset(); onClose(); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="What needs to be done?" autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
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
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-600'
                        : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
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
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="work, design, urgent (comma separated)"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { reset(); onClose(); }}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2 px-4 rounded-lg bg-primary-500 text-white hover:bg-primary-600 text-sm font-medium font-medium shadow-sm">
              {editingTask ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
