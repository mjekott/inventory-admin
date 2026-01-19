import { cn } from '@/lib/utils';

type Status = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'low' | 'normal' | 'high';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, { bg: string; text: string; dot: string }> = {
  pending: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  processing: {
    bg: 'bg-info/10',
    text: 'text-info',
    dot: 'bg-info',
  },
  shipped: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  delivered: {
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
  },
  cancelled: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    dot: 'bg-destructive',
  },
  low: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    dot: 'bg-destructive animate-pulse-soft',
  },
  normal: {
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
  },
  high: {
    bg: 'bg-info/10',
    text: 'text-info',
    dot: 'bg-info',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize',
        styles.bg,
        styles.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', styles.dot)} />
      {status}
    </span>
  );
}
