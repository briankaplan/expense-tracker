'use client';

import * as React from 'react';
import * as SelectPrimitive from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className,
}: SelectProps) {
  return (
    <SelectPrimitive.Listbox value={value} onChange={onChange}>
      <div className="relative mt-1">
        <SelectPrimitive.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <span className="block truncate">
            {options.find(option => option.value === value)?.label || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </SelectPrimitive.Button>
        <SelectPrimitive.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <SelectPrimitive.Option
              key={option.value}
              value={option.value}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {option.label}
                  </span>
                </>
              )}
            </SelectPrimitive.Option>
          ))}
        </SelectPrimitive.Options>
      </div>
    </SelectPrimitive.Listbox>
  );
} 