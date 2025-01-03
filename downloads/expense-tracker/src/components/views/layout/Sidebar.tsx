'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Expenses', href: '/expenses', icon: DocumentTextIcon },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCardIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-xl font-bold">Expense Manager</span>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive 
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }
                `}
              >
                <item.icon 
                  className={`
                    mr-3 h-6 w-6
                    ${isActive
                      ? 'text-gray-500 dark:text-gray-300'
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 