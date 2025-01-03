'use client';

import { forwardRef } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  as?: 'input' | 'textarea';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, as = 'input', ...props }, ref) => {
    const Component = as;
    return (
      <div className="relative">
        <Component
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${className}
          `}
          ref={ref as any}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input }; 