type BadgeVariant = 'win' | 'loss' | 'draw' | 'info' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const styles: Record<BadgeVariant, { bg: string; color: string }> = {
  win: { bg: 'var(--color-status-win-bg)', color: 'var(--color-status-win)' },
  loss: { bg: 'var(--color-status-loss-bg)', color: 'var(--color-status-loss)' },
  draw: { bg: 'var(--color-status-draw-bg)', color: 'var(--color-status-draw)' },
  info: { bg: 'var(--color-surface-overlay)', color: 'var(--color-text-secondary)' },
  primary: { bg: 'var(--color-brand-light)', color: 'var(--color-brand-primary)' },
};

export default function Badge({ variant = 'info', children }: BadgeProps) {
  const { bg, color } = styles[variant];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}
