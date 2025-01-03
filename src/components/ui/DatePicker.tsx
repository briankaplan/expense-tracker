'use client';

import * as React from 'react';
import { Select } from './Select';
import { addMonths, startOfMonth, endOfMonth, format, isValid } from 'date-fns';
import { Button } from './Button';
import { Input } from './Input';
import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

interface DatePickerProps {
  value?: { from: Date; to: Date };
  onChange?: (value: { from: Date; to: Date }) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');
  const [showCustomDialog, setShowCustomDialog] = React.useState(false);

  const currentMonth = startOfMonth(new Date());
  
  const dateRanges = [
    {
      label: 'Current Month',
      value: 'current',
      range: {
        from: startOfMonth(currentMonth),
        to: endOfMonth(currentMonth)
      }
    },
    {
      label: 'Last Month',
      value: 'last',
      range: {
        from: startOfMonth(addMonths(currentMonth, -1)),
        to: endOfMonth(addMonths(currentMonth, -1))
      }
    },
    {
      label: 'Last 3 Months',
      value: 'last3',
      range: {
        from: startOfMonth(addMonths(currentMonth, -3)),
        to: endOfMonth(currentMonth)
      }
    },
    {
      label: 'Last 6 Months',
      value: 'last6',
      range: {
        from: startOfMonth(addMonths(currentMonth, -6)),
        to: endOfMonth(currentMonth)
      }
    },
    {
      label: 'Year to Date',
      value: 'ytd',
      range: {
        from: startOfMonth(new Date(currentMonth.getFullYear(), 0, 1)),
        to: endOfMonth(currentMonth)
      }
    },
    {
      label: 'Custom Range',
      value: 'custom'
    }
  ];

  const formatDateRange = (from: Date, to: Date) => {
    return `${format(from, 'MMM dd, yyyy')} - ${format(to, 'MMM dd, yyyy')}`;
  };

  const getCurrentValue = () => {
    if (!value) return 'current';
    
    const preset = dateRanges.find(range => 
      range.range && 
      range.range.from.getTime() === value.from.getTime() &&
      range.range.to.getTime() === value.to.getTime()
    );

    return preset?.value || 'custom';
  };

  const handleCustomRange = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);

    if (isValid(start) && isValid(end)) {
      onChange?.({ from: start, to: end });
      setShowCustomDialog(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select.Root
        value={getCurrentValue()}
        onValueChange={(newValue) => {
          if (newValue === 'custom') {
            setShowCustomDialog(true);
            return;
          }

          const range = dateRanges.find(r => r.value === newValue)?.range;
          if (range && onChange) {
            onChange(range);
          }
        }}
      >
        <Select.Trigger className={className}>
          <Select.Value>
            {value ? formatDateRange(value.from, value.to) : 'Select period'}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {dateRanges.map((range) => (
            <Select.Item key={range.value} value={range.value}>
              {range.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="start-date">Start Date</label>
              <div className="flex gap-2">
                <Input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
                <Calendar className="h-4 w-4 opacity-50" />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="end-date">End Date</label>
              <div className="flex gap-2">
                <Input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
                <Calendar className="h-4 w-4 opacity-50" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomRange}>
              Apply Range
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 