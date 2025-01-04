import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
    return (
        <div
            className={cn(
                'relative overflow-auto',
                className
            )}
            {...props}
        >
            <div className="h-full w-full">
                {children}
            </div>
        </div>
    );
} 