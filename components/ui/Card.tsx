interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        backgroundColor: 'var(--color-surface-default)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {title && (
        <h2
          className="text-base font-bold mb-4 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '2px solid var(--color-brand-primary)',
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
