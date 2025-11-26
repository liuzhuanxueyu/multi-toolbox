import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../components/ui/Button';
import type { Task } from '../../store/tasksStore';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

/**
 * 可拖拽的任务卡片组件
 * 使用 @dnd-kit/sortable 实现拖拽排序
 */
export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 优先级样式配置
  const priorityConfig = {
    high: {
      bg: 'bg-red-500/10 dark:bg-red-500/20',
      border: 'border-red-500/30',
      tag: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
      label: '高',
    },
    medium: {
      bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      border: 'border-yellow-500/30',
      tag: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
      label: '中',
    },
    low: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      border: 'border-green-500/30',
      tag: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
      label: '低',
    },
  };

  const config = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
        isDragging
          ? 'opacity-50 shadow-lg scale-105 z-10'
          : 'hover:shadow-md'
      } ${
        task.completed
          ? 'bg-[var(--bg-primary)] border-[var(--border-color)] opacity-60'
          : `${config.bg} ${config.border}`
      }`}
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
      >
        <span className="text-[var(--text-secondary)]">⠿</span>
      </div>

      <div className="flex items-start gap-3 pl-6">
        {/* 复选框 */}
        <label className="relative flex items-center cursor-pointer mt-0.5">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="peer sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              task.completed
                ? 'bg-[var(--accent)] border-[var(--accent)]'
                : 'border-[var(--border-color)] hover:border-[var(--accent)]'
            }`}
          >
            {task.completed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>

        {/* 任务内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-medium transition-all duration-200 ${
                task.completed
                  ? 'line-through text-[var(--text-secondary)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {task.title}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.tag}`}>
              {config.label}
            </span>
          </div>

          {/* 描述 */}
          {task.description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
              {task.description}
            </p>
          )}

          {/* 截止日期 */}
          {task.dueDate && (
            <p className="mt-1.5 text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <span>📅</span>
              <span>{new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
            title="编辑任务"
          >
            ✏️
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            title="删除任务"
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}


