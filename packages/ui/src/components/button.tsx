import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-[var(--eo-radius-md)] px-5 py-3";

const variantStyles = {
  primary:
    "bg-[color:var(--eo-primary)] text-[color:var(--eo-primary-contrast)] shadow-[var(--eo-shadow-sm)] hover:bg-[color-mix(in_srgb,var(--eo-primary)_90%,#000)] focus-visible:outline-[color:var(--eo-primary)]",
  secondary:
    "border border-[color:var(--eo-muted)] bg-[color:var(--eo-bg-elevated)] text-[color:var(--eo-fg)] hover:bg-[color-mix(in_srgb,var(--eo-bg-elevated)_90%,#000)] focus-visible:outline-[color:var(--eo-primary)]",
  ghost:
    "bg-transparent text-[color:var(--eo-primary)] hover:bg-[color-mix(in_srgb,var(--eo-primary)_12%,transparent)] focus-visible:outline-[color:var(--eo-primary)]",
  danger:
    "bg-[color:var(--eo-danger)] text-white shadow-[var(--eo-shadow-sm)] hover:bg-[color-mix(in_srgb,var(--eo-danger)_92%,#000)] focus-visible:outline-[color:var(--eo-danger)]"
} as const;

const sizeStyles = {
  md: "text-base min-h-[44px]",
  lg: "text-lg min-h-[56px] px-6"
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
