'use client';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow rounded-lg ${className}`}
      {...props}
    />
  );
} 