import * as React from 'react';
import { cn } from '@/lib/utils';

interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {}

const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-muted/50 p-4 font-mono text-sm shadow-inner',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Terminal.displayName = 'Terminal';

export { Terminal }; 