import { useState, useCallback } from 'react';

const STORAGE_KEY = 'todo-tasks';

function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Silent fail - localStorage might be full or disabled
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState(loadTasks);

  const persist = useCallback((next) => {
    setTasks(next);
    saveTasks(next);
  }, []);

  const addTask = useCallback((task) => {
    setTasks((prev) => {
      const next = [
        ...prev,
        {
          ...task,
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
          order: prev.length,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];
      saveTasks(next);
      return next;
    });
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveTasks(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTasks(next);
      return next;
    });
  }, []);

  const toggleComplete = useCallback((id) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      saveTasks(next);
      return next;
    });
  }, []);

  const reorderTasks = useCallback((fromIndex, toIndex) => {
    setTasks((prev) => {
      // Order by current sort, then swap
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      const next = sorted.map((t, i) => ({ ...t, order: i }));
      saveTasks(next);
      return next;
    });
  }, []);

  return { tasks, addTask, updateTask, deleteTask, toggleComplete, reorderTasks };
}
