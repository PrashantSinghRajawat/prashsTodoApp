import { useState } from 'react';

export default function EmailPreferences({ prefs, onToggle, tasks }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const subscribe = async () => {
    if (!prefs.email || !prefs.reminderEnabled || tasks.length === 0) return;
    setSaving(true);
    try {
      const origin = window.location.origin;
      const res = await fetch(`${origin}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: prefs.email, tasks, reminderTime: prefs.reminderTime }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        return true;
      } else {
        console.error('Subscribe failed:', data.error || res.statusText);
      }
    } catch (err) {
      console.error('Subscribe error:', err.message);
    } finally {
      setSaving(false);
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
            const next = !prefs.reminderEnabled;
            onToggle('reminderEnabled', next);
            if (next && prefs.email && tasks.length > 0) subscribe();
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
          {/* Time picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">Time:</label>
            <input
              type="time"
              value={prefs.reminderTime || '09:00'}
              onChange={(e) => { onToggle('reminderTime', e.target.value); }}
              className="w-24 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
            />
          </div>
          {/* Email */}
          <input
            type="email"
            value={prefs.email}
            onChange={(e) => onToggle('email', e.target.value)}
            onBlur={(e) => { if (e.target.value && tasks.length > 0) subscribe(); }}
            placeholder="your@email.com"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400"
          />
          {/* Sync button */}
          <button
            onClick={subscribe}
            disabled={saving || !prefs.email}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing...
              </>
            ) : saved ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Synced!
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync tasks to remote
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
