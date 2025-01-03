'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from '@heroicons/react/24/outline';
import { DayPicker } from 'react-day-picker';
import { Button } from './Button';
import { Popover } from './Popover';

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export function DatePicker({ date, onSelect }: DatePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(date);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className={`w-[280px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(date) => {
            setSelected(date);
            onSelect?.(date);
          }}
          initialFocus
        />
      </Popover.Content>
    </Popover>
  );
} 