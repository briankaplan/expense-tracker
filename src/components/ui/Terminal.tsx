import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ScrollArea';

interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Terminal({ className, children, ...props }: TerminalProps) {
    return (
        <div
            className={cn(
                'bg-black rounded-lg p-4 font-mono text-sm text-green-400',
                className
            )}
            {...props}
        >
            <ScrollArea className="h-full">
                <div className="space-y-2">
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
} 