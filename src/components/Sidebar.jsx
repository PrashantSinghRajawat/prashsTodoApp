import { useMemo, useEffect } from 'react';
import EmailPreferences from './EmailPreferences';

const filterIcons = {
  all: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  active: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.213 18.53L6.4 7.785l12.683 6.745L6.4 18.53l6.813-10.745L6.4 14.533" />
    </svg>
  ),
  completed: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
};

export default function Sidebar({ tasks, filters, onFilterChange, onSearch, search, onCompleteAll, emailPrefs, onEmailToggle }) {
  const allTags = useMemo(() => {
    const tagSet = new Set();
    tasks.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return [...tagSet].sort();
  }, [tasks]);

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const filterOptions = ['all', 'active', 'completed'];
  const filterLabels = { all: 'All Tasks', active: 'Active', completed: 'Completed' };

  useEffect(() => {
    const handler = () => {
      document.getElementById('add-task-btn')?.click();
    };
    document.addEventListener('taskflow:new-task', handler);
    return () => document.removeEventListener('taskflow:new-task', handler);
  }, []);

  return (
    <aside className="w-56 flex-shrink-0 space-y-6" aria-label="Sidebar">
      {/* Filter buttons */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Filters</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {filterOptions.map((f) => {
            const isActive = filters.filter === f;
            return (
              <button key={f}
                onClick={() => onFilterChange(f)}
                role="tab"
                aria-selected={isActive}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-sm'
                }`}
              >
                <span className={isActive ? 'text-violet-200' : 'text-gray-400 dark:text-gray-500 group-hover:text-violet-500'}>
                  {filterIcons[f]}
                </span>
                <span className="flex-1 text-left">{filterLabels[f]}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-300'
                }`}>
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete All */}
      {tasks.length > 0 && counts.active > 0 && (
        <button onClick={onCompleteAll}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-700 dark:hover:text-green-400 transition-all duration-150">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Complete All
        </button>
      )}

      {/* Search */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Search</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
            {filterIcons.search}
          </div>
          <input
            id="search-input"
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
          />
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button key={tag}
                onClick={() => onFilterChange(`tag:${tag}`)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-all ${
                  filters.filter === `tag:${tag}`
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <EmailPreferences
        prefs={emailPrefs}
        onToggle={onEmailToggle}
        tasks={tasks}
      />
    </aside>
  );
}
