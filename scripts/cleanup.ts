const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');

// Define the exact structure we want
const REQUIRED_STRUCTURE = {
  'src/components/ui': [
    'Badge.tsx',
    'Button.tsx',
    'Card.tsx',
    'DatePicker.tsx',
    'Dialog.tsx',
    'Input.tsx',
    'Select.tsx'
  ],
  'src/components/views/layout': [
    'AppShell.tsx',
    'Header.tsx',
    'Sidebar.tsx'
  ],
  'src/components/views/expenses': [
    'ExpenseManagerView.tsx',
    'ExpenseList.tsx',
    'ExpenseSummary.tsx'
  ],
  'src/components/views/subscriptions': [
    'SubscriptionsView.tsx',
    'SubscriptionCard.tsx'
  ],
  'src/lib/firebase': [
    'config.ts',
    'admin.ts'
  ],
  'src/lib/hooks': [
    'useAuth.ts',
    'useExpenses.ts',
    'useSubscriptions.ts'
  ],
  'src/lib/services': [
    'expenses.ts',
    'subscriptions.ts'
  ],
  'src/lib/utils': [
    'format.ts'
  ],
  'app': [
    'layout.tsx',
    'page.tsx'
  ],
  'app/expenses': [
    'page.tsx'
  ],
  'app/subscriptions': [
    'page.tsx'
  ],
  'app/upload': [
    'layout.tsx',
    'page.tsx'
  ]
};

// Create all required directories
Object.keys(REQUIRED_STRUCTURE).forEach(dir => {
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Remove any incorrect directories
const FORBIDDEN_PATHS = [
  'components',
  'lib',
  'src/components/auth',
  'src/components/views/components',
  'src/components/views/expenses/components',
  'src/components/views/subscriptions/components'
];

FORBIDDEN_PATHS.forEach(dir => {
  const fullPath = join(process.cwd(), dir);
  if (existsSync(fullPath)) {
    execSync(`rm -rf ${fullPath}`);
    console.log(`Removed forbidden directory: ${dir}`);
  }
});

console.log('Directory structure cleanup complete!'); 