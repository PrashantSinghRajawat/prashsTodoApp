export default function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return action.payload;

    case 'ADD_TASK': {
      const newTask = {
        ...action.payload,
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
        order: state.length,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [...state, newTask];
    }

    case 'UPDATE_TASK':
      return state.map((t) =>
        t.id === action.id ? { ...t, ...action.updates, updatedAt: new Date().toISOString() } : t
      );

    case 'DELETE_TASK':
      return state.filter((t) => t.id !== action.id);

    case 'TOGGLE_COMPLETE':
      return state.map((t) =>
        t.id === action.id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
      );

    case 'REORDER': {
      const { fromIndex, toIndex } = action;
      const sorted = [...state].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      return sorted.map((t, i) => ({ ...t, order: i, updatedAt: new Date().toISOString() }));
    }

    case 'IMPORT': {
      return action.payload.map((t, i) => ({ ...t, order: i }));
    }

    case 'BULK_COMPLETE':
      return state.map((t) => t.completed ? t : { ...t, completed: true, updatedAt: new Date().toISOString() });

    default:
      return state;
  }
}
