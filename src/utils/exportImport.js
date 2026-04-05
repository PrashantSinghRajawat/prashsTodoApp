const STORAGE_KEY = 'todo-tasks';

export function exportTasks(tasks) {
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importTasks() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = (ev) => {
        try {
          const tasks = JSON.parse(ev.target.result);
          if (!Array.isArray(tasks)) throw new Error('Invalid format');
          // Basic validation
          for (const t of tasks) {
            if (typeof t !== 'object' || !t.id || !t.title) throw new Error('Invalid task data');
          }
          resolve(tasks);
        } catch (err) {
          reject(new Error('Invalid JSON file — must be a TaskFlow backup'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

export function getStorageKey() {
  return STORAGE_KEY;
}
