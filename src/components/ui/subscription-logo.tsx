'use client';

import { useSubscriptionLogo } from '@/lib/hooks/useSubscriptionLogo';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SubscriptionLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  domain?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function SubscriptionLogo({
  name,
  domain,
  size = 'md',
  fallback,
  className,
  ...props
}: SubscriptionLogoProps) {
  const { logo, isLoading, error } = useSubscriptionLogo(name, domain);

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg bg-muted flex items-center justify-center',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (error || !logo) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        className={cn(
          'rounded-lg bg-muted flex items-center justify-center',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className="text-xl font-bold text-muted-foreground">
          {name[0].toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden bg-background',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <img
        src={logo}
        alt={`${name} logo`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Hide broken images
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
} 