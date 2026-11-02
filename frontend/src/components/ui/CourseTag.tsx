import { cn, getContrastColor } from '@/lib/utils';
import type { Course } from '@/lib/types';

interface CourseTagProps {
  course?: Course;
  code?: string;
  name?: string;
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CourseTag({
  course,
  code: directCode,
  name: directName,
  color: directColor,
  size = 'md',
  className,
}: CourseTagProps) {
  const code = course?.code || directCode || 'COURSE';
  const name = course?.name || directName;
  const color = course?.color || directColor || '#6366F1';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
      style={{
        backgroundColor: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
      }}
      title={name}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {code}
      {name && size === 'md' && (
        <span className="opacity-70 hidden sm:inline truncate max-w-[120px]">{name}</span>
      )}
    </span>
  );
}
