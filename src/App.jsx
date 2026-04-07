import { useState, useMemo, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTasks } from './hooks/useTasks';
import { useEmailPreferences } from './hooks/useEmailPreferences';
import { useToast } from './hooks/useToast';
import { exportTasks, importTasks } from './utils/exportImport';
import ErrorBoundary from './components/ErrorBoundary';
import MiniStats from './components/MiniStats';
import TaskBoard from './components/TaskBoard';
import Sidebar from './components/Sidebar';
import EmailPreferences from './components/EmailPreferences';
import StatsPanel from './components/StatsPanel';
import ToastContainer from './components/ToastContainer';
import ConfirmDialog from './components/ConfirmDialog';

function AppContent() {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete, reorderTasks, completeAll, importAll } = useTasks();
  const { prefs: emailPrefs, update: updateEmailPref } = useEmailPreferences();
  const { toasts, addToast, removeToast } = useToast();
  const [taskFilter, setTaskFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dark-mode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Confirm dialog state for delete
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });

  useEffect(() => {
    localStorage.setItem('dark-mode', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('taskflow:new-task'));
      }
      if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setDark((d) => !d);
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearch('');
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sorted = [...tasks].sort((a, b) => a.order - b.order);
    const oldIndex = sorted.findIndex((t) => t.id === active.id);
    const newIndex = sorted.findIndex((t) => t.id === over.id);
    reorderTasks(oldIndex, newIndex);
  };

  const handleDeleteRequest = useCallback((id, title) => {
    setConfirmDelete({ open: true, id, title });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (confirmDelete.id !== null) {
      deleteTask(confirmDelete.id);
      addToast('Task deleted', 'info');
    }
    setConfirmDelete({ open: false, id: null, title: '' });
  }, [confirmDelete.id, deleteTask, addToast]);

  const handleDeleteCancel = useCallback(() => {
    setConfirmDelete({ open: false, id: null, title: '' });
  }, []);

  const handleSave = (data) => {
    if (data.id) {
      const { id, ...updates } = data;
      updateTask(id, updates);
      addToast('Task updated', 'success');
    } else {
      addTask(data);
      addToast('Task created', 'success');
    }
  };

  const handleToggle = (id) => {
    toggleComplete(id);
  };

  const handleExport = () => {
    if (tasks.length === 0) {
      addToast('No tasks to export', 'info');
      return;
    }
    exportTasks(tasks);
    addToast(`${tasks.length} tasks exported`, 'success');
  };

  const handleImport = async () => {
    try {
      const imported = await importTasks();
      importAll(imported);
      addToast(`Imported ${imported.length} tasks`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompleteAll = () => {
    completeAll();
    addToast('All tasks completed!', 'success');
  };

  const filtered = useMemo(() => {
    let result = tasks;
    if (taskFilter === 'active') result = result.filter((t) => !t.completed);
    else if (taskFilter === 'completed') result = result.filter((t) => t.completed);
    else if (taskFilter.startsWith('tag:')) {
      const tag = taskFilter.slice(4);
      result = result.filter((t) => t.tags?.includes(tag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => a.order - b.order);
  }, [tasks, taskFilter, search]);

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950' : 'bg-gray-50'} transition-colors`}>
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile menu button — hidden on tablet+ */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center shadow-sm">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">TaskFlow</h1>
          </div>

          <div className="flex items-center gap-1">
            {/* Import/Export — hidden on mobile, icon-only on tablet, full on desktop */}
            <div className="hidden md:flex items-center gap-2 mr-2 pr-3 border-r border-gray-200 dark:border-slate-700">
              <button onClick={handleImport} aria-label="Import tasks"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12h6m-3-3v6" />
                </svg>
                <span className="hidden xl:inline">Import</span>
              </button>
              <button onClick={handleExport} aria-label="Export tasks"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden xl:inline">Export</span>
              </button>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.71-.71M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & tablet overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Compact stats mini-bar — visible on mobile & tablet only */}
        <div className="md:hidden mb-4">
          <MiniStats tasks={tasks} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
          {/* Sidebar — slides in on mobile & tablet, static on desktop */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 lg:w-56 xl:w-60 lg:static lg:flex-shrink-0 transform transition-transform duration-200 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } bg-white dark:bg-slate-900 lg:bg-transparent dark:lg:bg-transparent p-4 lg:p-0 border-r lg:border-0 border-gray-200 dark:border-slate-700`}
          >
            <div className="pt-16 lg:pt-0 space-y-5 lg:space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto pb-20 lg:pb-0">
              <Sidebar
                tasks={tasks}
                filters={{ filter: taskFilter }}
                onFilterChange={(f) => { setTaskFilter(f); setSidebarOpen(false); }}
                onSearch={setSearch}
                search={search}
                onCompleteAll={handleCompleteAll}
                emailPrefs={emailPrefs}
                onEmailToggle={updateEmailPref}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <TaskBoard
                  tasks={filtered}
                  onToggle={handleToggle}
                  onDelete={handleDeleteRequest}
                  onUpdate={updateTask}
                  onReorder={reorderTasks}
                  onSave={handleSave}
                />
              </SortableContext>
            </DndContext>
          </div>

          {/* Desktop stats — hidden on mobile & tablet */}
          <div className="hidden lg:block lg:flex-shrink-0">
            <StatsPanel tasks={tasks} />
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-slate-800 py-4 sm:py-6 text-center px-4">
        <p className="text-sm text-gray-500 dark:text-slate-500">
          Developed by <span className="font-semibold text-gray-600 dark:text-slate-300">Prashcode</span> with{" "}
          <span className="inline-block animate-pulse text-red-500">&hearts;</span>
        </p>
      </footer>

      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Delete Task"
        message={`Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmLabel="Delete"
        confirmClass="bg-red-500 hover:bg-red-600 text-white"
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
