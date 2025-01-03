'use client';

import { Menu } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1">
          {/* Search could go here */}
        </div>
        <div className="ml-4 flex items-center">
          <Menu as="div" className="relative">
            <Menu.Button className="flex rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none">
              <UserCircleIcon className="h-6 w-6" />
            </Menu.Button>
            {/* Profile dropdown menu items would go here */}
          </Menu>
        </div>
      </div>
    </div>
  );
} 