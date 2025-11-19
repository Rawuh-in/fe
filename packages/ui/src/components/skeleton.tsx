import clsx from 'clsx';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded-md bg-[var(--eo-muted)]", className)}
      {...props}
    />
  );
}
