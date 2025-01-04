"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const TabsContext = React.createContext<{
    value: string;
    onChange: (value: string) => void;
}>({
    value: '',
    onChange: () => {}
});

export function Tabs({ defaultValue, children, className, ...props }: TabsProps) {
    const [value, setValue] = React.useState(defaultValue || '');

    return (
        <TabsContext.Provider value={{ value, onChange: setValue }}>
            <div className={cn('space-y-4', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, children, ...props }: TabsListProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
    const { value: selectedValue, onChange } = React.useContext(TabsContext);
    const isSelected = value === selectedValue;

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-muted hover:text-foreground',
                className
            )}
            onClick={() => onChange(value)}
            {...props}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
    const { value: selectedValue } = React.useContext(TabsContext);
    const isSelected = value === selectedValue;

    if (!isSelected) return null;

    return (
        <div
            className={cn(
                'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
} 