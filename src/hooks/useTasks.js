import { useReducer, useCallback, useEffect } from 'react';
import taskReducer from './taskReducer';

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
    // Storage quota exceeded or disabled
  }
}

export function useTasks() {
  const [tasks, dispatch] = useReducer(taskReducer, loadTasks());

  // Persist on every change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveTasks(tasks);
    }
  }, [tasks]);

  const addTask = useCallback((task) => dispatch({ type: 'ADD_TASK', payload: task }), []);
  const updateTask = useCallback((id, updates) => dispatch({ type: 'UPDATE_TASK', id, updates }), []);
  const deleteTask = useCallback((id) => dispatch({ type: 'DELETE_TASK', id }), []);
  const toggleComplete = useCallback((id) => dispatch({ type: 'TOGGLE_COMPLETE', id }), []);
  const reorderTasks = useCallback((fromIndex, toIndex) => dispatch({ type: 'REORDER', fromIndex, toIndex }), []);
  const importAll = useCallback((importedTasks) => dispatch({ type: 'IMPORT', payload: importedTasks }), []);
  const completeAll = useCallback(() => dispatch({ type: 'BULK_COMPLETE' }), []);

  return { tasks, addTask, updateTask, deleteTask, toggleComplete, reorderTasks, importAll, completeAll };
}
