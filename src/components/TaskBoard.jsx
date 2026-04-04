import { useState } from 'react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

export default function TaskBoard({ tasks, onToggle, onDelete, onUpdate, onReorder }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleSave = (data) => {
    if (editingTask) {
      const { id, ...updates } = data;
      onUpdate(id, updates);
    }
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleCloseModal = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Tasks ({tasks.length})
        </h2>
        <button
          onClick={() => { setEditingTask(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto w-16 h-16 text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-gray-400 dark:text-slate-500 font-medium">No tasks yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <TaskForm isOpen={formOpen} onClose={handleCloseModal} onSave={handleSave} editingTask={editingTask} />
    </div>
  );
}
