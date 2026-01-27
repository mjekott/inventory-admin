import { cn } from '@/lib/utils';

type Status =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'low'
  | 'normal'
  | 'high'
  | 'confirmed'
  | 'completed';

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
  confirmed: {
    bg: 'bg-blue-100',   // light blue background
    text: 'text-blue-600', // blue text
    dot: 'bg-blue-600 animate-pulse-soft', // pulsing dot
  },
  completed: {
    bg: 'bg-green-100',   // light green background
    text: 'text-green-600', // green text
    dot: 'bg-green-600',   // static dot
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
