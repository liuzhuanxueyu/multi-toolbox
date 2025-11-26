import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
}

/**
 * 标签组件
 */
export function Tag({
  children,
  variant = 'default',
  size = 'sm',
  removable = false,
  onRemove,
  onClick,
  active = false,
}: TagProps) {
  const baseStyles = 'inline-flex items-center gap-1 rounded-full font-medium transition-all';

  const variants = {
    default: active
      ? 'bg-[var(--accent)] text-white'
      : 'bg-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--accent)]/20',
    primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const handleClick = onClick
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
      }
    : undefined;

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </span>
  );
}


