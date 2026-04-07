import { isBefore } from 'date-fns';

export default function MiniStats({ tasks }) {
  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = total - completedCount;
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && isBefore(new Date(t.dueDate), new Date(new Date().toDateString()))).length;

  const stats = [
    { label: 'Total', value: total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Active', value: activeCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Done', value: completedCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Overdue', value: overdueCount, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Task summary">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-1.5 sm:py-2 ${s.bg}`}>
          <div className={`text-base sm:text-lg font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
