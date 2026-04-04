import { useMemo } from 'react';

const filterIcons = {
  all: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  active: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default function Sidebar({ tasks, filters, onFilterChange, onSearch, search }) {
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

  return (
    <aside className="w-56 flex-shrink-0 space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Filters</h3>
        <nav className="space-y-1">
          {filterOptions.map((f) => (
            <button key={f}
              onClick={() => onFilterChange(f)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.filter === f
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {filterIcons[f]}
              <span className="flex-1 text-left">{filterLabels[f]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filters.filter === f
                  ? 'bg-primary-200/50 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
              }`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Search</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
            {filterIcons.search}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button key={tag}
                onClick={() => onFilterChange(`tag:${tag}`)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                  filters.filter === `tag:${tag}`
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                    : 'bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
