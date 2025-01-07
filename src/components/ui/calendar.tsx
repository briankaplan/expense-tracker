'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  title: string;
  color?: string;
  date: Date;
}

export type CalendarProps = DayPickerProps & {
  events?: CalendarEvent[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  events = [],
  ...props
}: CalendarProps) {
  const renderDay = (day: Date) => {
    if (!day) return null;

    const dayEvents = events.filter(event => 
      event.date.getDate() === day.getDate() &&
      event.date.getMonth() === day.getMonth() &&
      event.date.getFullYear() === day.getFullYear()
    );

    return (
      <div className="w-full h-full min-h-[100px] p-2">
        <div className="text-sm">{day.getDate()}</div>
        <div className="mt-1 space-y-1">
          {dayEvents.map((event, index) => (
            <div
              key={index}
              className="text-xs px-1 py-0.5 rounded truncate"
              style={{
                backgroundColor: event.color || '#4CAF50',
                color: 'white'
              }}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        caption: "flex justify-between pt-1 relative items-center px-2",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground rounded-md"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7",
        head_cell: "text-muted-foreground text-sm font-medium py-2 text-center",
        row: "grid grid-cols-7",
        cell: "relative p-0 focus-within:relative focus-within:z-20 border",
        day: "h-full w-full p-0",
        day_selected: "bg-primary text-primary-foreground",
        day_today: "bg-accent/10",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Day: ({ date, ...props }) => (
          <div {...props}>
            {renderDay(date)}
          </div>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar }; 