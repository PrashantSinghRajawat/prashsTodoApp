import { isBefore } from 'date-fns';

export default function StatsPanel({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && isBefore(new Date(t.dueDate), new Date(new Date().toDateString()))).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total', value: total, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    ), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Active', value: active, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Done', value: completed, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Overdue', value: overdue, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    ), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
  ];

  return (
    <div className="w-60 flex-shrink-0">
      <h3 className="text-xs font-semibold text-gray-600 dark:text-slate-500 uppercase tracking-wider mb-3">Stats</h3>
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
            <div className="flex items-center gap-3">
              <div className={s.color}>{s.icon}</div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-600">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-600">Completion</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{rate}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
