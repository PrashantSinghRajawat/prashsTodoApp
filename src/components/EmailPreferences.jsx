export default function EmailPreferences({ prefs, onToggle, tasks }) {
  const subscribe = async () => {
    if (!prefs.email || !prefs.reminderEnabled || tasks.length === 0) return;
    try {
      const res = await fetch(`/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: prefs.email, tasks, reminderTime: prefs.reminderTime }),
      });
      if (res.ok) return true;
    } catch {
      // Backend not deployed yet
    }
    return false;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        Reminders
      </h3>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-300">Email reminders</span>
        <button
          onClick={() => {
            onToggle('reminderEnabled', !prefs.reminderEnabled);
            if (!prefs.reminderEnabled && prefs.email) subscribe();
          }}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            prefs.reminderEnabled ? 'bg-violet-500' : 'bg-gray-300 dark:bg-slate-600'
          }`}
          role="switch"
          aria-checked={prefs.reminderEnabled}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              prefs.reminderEnabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {prefs.reminderEnabled && (
        <div className="space-y-2 animate-slideIn">
          <input
            type="email"
            value={prefs.email}
            onChange={(e) => { onToggle('email', e.target.value); }}
            onBlur={(e) => { if (e.target.value) subscribe(); }}
            placeholder="your@email.com"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400"
          />
        </div>
      )}
    </div>
  );
}
