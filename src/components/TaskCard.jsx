import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isBefore, isToday } from 'date-fns';

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const tagColors = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
];

function getTagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return tagColors[Math.abs(hash) % tagColors.length];
}

export default function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const { attributes, listeners, isDragging, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = task.dueDate && !task.completed && isBefore(new Date(task.dueDate), new Date(new Date().toDateString()));

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task.id, task.title);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group task-card-shadow bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 animate-slideIn hover:border-violet-200 dark:hover:border-violet-700"
      role="listitem"
      aria-label={`Task: ${task.title}${task.completed ? ', completed' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            task.completed
              ? 'bg-violet-500 border-violet-500 text-white'
              : 'border-gray-300 dark:border-slate-500 hover:border-violet-400'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <button
            className="text-left w-full cursor-grab active:cursor-grabbing select-none"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            tabIndex={0}
          >
            <h3 className={`font-medium text-gray-900 dark:text-gray-100 leading-snug ${
              task.completed ? 'line-through text-gray-500 dark:text-gray-500' : ''
            }`}>
              {task.title}
            </h3>
          </button>

          {task.description && (
            <p className={`text-sm mt-1 text-gray-600 dark:text-gray-400 line-clamp-2 ${
              task.completed ? 'line-through' : ''
            }`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority || 'low']}`} title={`${task.priority || 'low'} priority`} />

            {task.dueDate && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                overdue
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : isToday(task.dueDate)
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
              }`}>
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {task.tags?.map((tag) => (
              <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Edit task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Delete task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
