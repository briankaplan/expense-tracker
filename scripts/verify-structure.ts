import { existsSync } from 'fs';
import { join } from 'path';

const requiredPaths = [
  // Core directories
  'src/components/ui',
  'src/components/views/layout',
  'src/components/views/auth',
  'src/components/views/expenses',
  'src/lib/firebase',
  'src/lib/hooks',
  'src/lib/services',
  
  // Core files
  'src/components/views/layout/AppShell.tsx',
  'src/components/views/layout/MainLayout.tsx',
  'src/components/views/layout/Header.tsx',
  'src/components/views/layout/Sidebar.tsx',
  
  // UI Components
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Select.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/ui/Dialog.tsx',
  'src/components/ui/DatePicker.tsx',
  
  // Pages
  'app/layout.tsx',
  'app/page.tsx',
  'app/login/page.tsx',
  'app/expenses/page.tsx'
];

const missingPaths = requiredPaths.filter(
  path => !existsSync(join(process.cwd(), path))
);

if (missingPaths.length) {
  console.error('Missing required paths:', missingPaths);
  process.exit(1);
} else {
  console.log('All required paths exist!');
} 