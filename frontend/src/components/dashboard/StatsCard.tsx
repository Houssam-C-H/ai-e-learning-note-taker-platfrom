import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accentColor?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = '#6366F1',
  isLoading = false,
}: StatsCardProps) {
  return (
    <div className="card group hover:border-accent/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend.value >= 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            <TrendingUp className={cn('w-3 h-3', trend.value < 0 && 'rotate-180')} />
            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
          </div>
        )}
      </div>

      {isLoading ? (
        <>
          <div className="skeleton h-8 w-20 mb-1" />
          <div className="skeleton h-4 w-28" />
        </>
      ) : (
        <>
          <div className="text-3xl font-bold text-text-primary mb-1 tabular-nums">{value}</div>
          <div className="text-sm text-text-muted">{title}</div>
          {trend && (
            <div className="text-xs text-text-muted mt-1">{trend.label}</div>
          )}
        </>
      )}
    </div>
  );
}
