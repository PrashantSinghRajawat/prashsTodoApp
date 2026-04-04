import { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTasks } from './hooks/useTasks';
import TaskBoard from './components/TaskBoard';
import Sidebar from './components/Sidebar';
import StatsPanel from './components/StatsPanel';

function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete, reorderTasks } = useTasks();
  const [taskFilter, setTaskFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dark-mode') === 'true' ||
        (!localStorage.getItem('dark-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('dark-mode', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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

  const handleSave = (data) => {
    if (data.id) {
      const { id, ...updates } = data;
      updateTask(id, updates);
    } else {
      addTask(data);
    }
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
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => a.order - b.order);
  }, [tasks, taskFilter, search]);

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950' : 'bg-gray-50'} transition-colors`}>
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">TaskFlow</h1>
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
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <Sidebar
            tasks={tasks}
            filters={{ filter: taskFilter }}
            onFilterChange={setTaskFilter}
            onSearch={setSearch}
            search={search}
          />

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <TaskBoard
                tasks={filtered}
                onToggle={toggleComplete}
                onDelete={deleteTask}
                onUpdate={updateTask}
                onReorder={reorderTasks}
                onSave={handleSave}
              />
            </SortableContext>
          </DndContext>

          <StatsPanel tasks={tasks} />
        </div>
      </main>
    </div>
  );
}

export default App
