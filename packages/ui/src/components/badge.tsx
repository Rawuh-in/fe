import clsx from "clsx";
import type { HTMLAttributes, JSX } from "react";

const baseStyles =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide";

const variantStyles = {
  default:
    "border-[color:var(--eo-muted)] bg-[color:var(--eo-bg-elevated)] text-[color:var(--eo-muted-text)]",
  success:
    "border-transparent bg-[color:color-mix(in_srgb,var(--eo-success)_12%,transparent)] text-[color:var(--eo-success)]",
  warning:
    "border-transparent bg-[color:color-mix(in_srgb,var(--eo-warning)_16%,transparent)] text-[color:var(--eo-warning)]",
  warningStrong:
    "border-transparent bg-[color:color-mix(in_srgb,var(--eo-warning-strong)_16%,transparent)] text-[color:var(--eo-warning-strong)]",
  danger:
    "border-transparent bg-[color:color-mix(in_srgb,var(--eo-danger)_16%,transparent)] text-[color:var(--eo-danger)]",
  primary:
    "border-transparent bg-[color:var(--eo-primary)] text-[color:var(--eo-primary-contrast)]"
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps): JSX.Element {
  return (
    <span
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}
