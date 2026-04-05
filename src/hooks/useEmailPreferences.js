import { useState, useCallback, useEffect } from 'react';

const PREFS_KEY = 'todo-email-prefs';

function loadPreferences() {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? JSON.parse(data) : { email: '', reminderEnabled: false, reminderTime: '09:00' };
  } catch {
    return { email: '', reminderEnabled: false, reminderTime: '09:00' };
  }
}

function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or disabled
  }
}

export function useEmailPreferences() {
  const [prefs, setPrefs] = useState(loadPreferences);

  const update = useCallback((field, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [field]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  const setAll = useCallback((newPrefs) => {
    setPrefs(newPrefs);
    savePreferences(newPrefs);
  }, []);

  return { prefs, update, setAll };
}
