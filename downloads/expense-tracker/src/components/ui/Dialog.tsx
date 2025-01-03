'use client';

import * as React from 'react';
import * as DialogPrimitive from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Dialog = DialogPrimitive.Dialog;

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Dialog {...props}>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/30" />
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <DialogPrimitive.Panel
          ref={ref}
          className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
        >
          {children}
          <DialogPrimitive.Button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={props.onClose}
          >
            <XMarkIcon className="h-4 w-4" />
          </DialogPrimitive.Button>
        </DialogPrimitive.Panel>
      </div>
    </div>
  </DialogPrimitive.Dialog>
));
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="mb-4 text-lg font-medium leading-6 text-gray-900"
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = DialogPrimitive.Title;

export { Dialog, DialogContent, DialogHeader, DialogTitle }; 