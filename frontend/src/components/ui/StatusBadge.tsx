import { cn } from '@/lib/utils';
import type { SessionStatus } from '@/lib/types';
import { Clock, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: SessionStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  SessionStatus,
  { label: string; className: string; Icon: React.ElementType }
> = {
  queued: {
    label: 'Queued',
    className: 'badge-queued',
    Icon: Clock,
  },
  transcribing: {
    label: 'Transcribing',
    className: 'badge-transcribing',
    Icon: Loader2,
  },
  generating: {
    label: 'Generating',
    className: 'badge-generating',
    Icon: Sparkles,
  },
  processing: {
    label: 'GPT-4o Processing',
    className: 'badge-generating',
    Icon: Sparkles,
  },
  ready: {
    label: 'Ready',
    className: 'badge-ready',
    Icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'badge-failed',
    Icon: XCircle,
  },
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.queued;
  const { label, className: statusClass, Icon } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        statusClass,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            'w-3 h-3 flex-shrink-0',
            (status === 'transcribing' || status === 'generating' || status === 'processing') && 'animate-spin'
          )}
        />
      )}
      {label}
    </span>
  );
}
