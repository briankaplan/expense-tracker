'use client';

import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={badgeVariants({ variant, className })} {...props} />;
} 