'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSelect'> & {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
};

export function DateInput({ 
  date,
  onSelect,
  className,
  ...props
}: DateInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (onSelect) {
      onSelect(selectedDate);
    }
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={date ? format(date, 'PP') : ''}
        readOnly
        className={cn('pr-10', className)}
        {...props}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          >
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 