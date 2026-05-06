interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center py-8">
      <div
        className={`${sizes[size]} border-4 rounded-full animate-spin`}
        style={{
          borderColor: 'var(--color-border-default)',
          borderTopColor: 'var(--color-brand-primary)',
        }}
      />
    </div>
  );
}
