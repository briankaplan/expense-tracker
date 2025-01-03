import { chalk, joinPath, checkDirectory, checkFile } from './utils/fs-helpers';

const REQUIRED_PATHS = {
  // Core directories
  directories: [
    'src/components/ui',
    'src/components/views/layout',
    'src/components/views/auth',
    'src/components/views/expenses',
    'src/lib/firebase',
    'src/lib/hooks',
    'src/lib/services'
  ],
  
  // Core files
  files: {
    layout: [
      'src/components/views/layout/AppShell.tsx',
      'src/components/views/layout/MainLayout.tsx',
      'src/components/views/layout/Header.tsx',
      'src/components/views/layout/Sidebar.tsx'
    ],
    ui: [
      'src/components/ui/Button.tsx',
      'src/components/ui/Card.tsx',
      'src/components/ui/Input.tsx',
      'src/components/ui/Select.tsx',
      'src/components/ui/Badge.tsx',
      'src/components/ui/Dialog.tsx',
      'src/components/ui/DatePicker.tsx'
    ],
    pages: [
      'app/layout.tsx',
      'app/page.tsx',
      'app/login/page.tsx',
      'app/expenses/page.tsx'
    ]
  }
};

export async function verifyStructure(): Promise<void> {
  console.log(chalk.blue('\n🔍 Verifying project structure...\n'));
  
  let hasErrors = false;

  // Check directories
  console.log(chalk.blue('\nChecking directories:'));
  REQUIRED_PATHS.directories.forEach(dir => {
    const fullPath = joinPath(process.cwd(), dir);
    if (!checkDirectory(fullPath)) {
      console.log(chalk.red(`  ❌ Missing directory: ${dir}`));
      hasErrors = true;
    } else {
      console.log(chalk.green(`  ✓ ${dir}`));
    }
  });

  // Check files by category
  Object.entries(REQUIRED_PATHS.files).forEach(([category, files]) => {
    console.log(chalk.blue(`\nChecking ${category} files:`));
    files.forEach(file => {
      const fullPath = joinPath(process.cwd(), file);
      if (!checkFile(fullPath)) {
        console.log(chalk.red(`  ❌ Missing file: ${file}`));
        hasErrors = true;
      } else {
        console.log(chalk.green(`  ✓ ${file}`));
      }
    });
  });

  if (hasErrors) {
    console.log(chalk.red('\n❌ Structure verification failed! See errors above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All required paths exist!\n'));
  }
} 