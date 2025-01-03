const {
  chalk,
  checkDirectory,
  checkFile,
  readDirectory,
  readFile,
  joinPath
} = require('./utils/fs-helpers');

interface DirectoryStructure {
  [key: string]: string[];
}

const REQUIRED_STRUCTURE: DirectoryStructure = {
  'src/components/ui': [
    'Badge.tsx',
    'Button.tsx',
    'Card.tsx',
    'DataTable.tsx',
    'DropdownMenu.tsx',
    'ThemeToggle.tsx',
    'Avatar.tsx',
    'SearchInput.tsx',
    'DateRangePicker.tsx'
  ],
  'src/components/providers': [
    'ThemeProvider.tsx'
  ],
  'src/components/views/layout': [
    'AppShell.tsx',
    'Header.tsx',
    'Sidebar.tsx',
    'UserNav.tsx'
  ],
  'src/components/views/dashboard': [
    'DashboardView.tsx',
    'RecentExpenses.tsx',
    'RecentReceipts.tsx',
    'PeriodSummary.tsx'
  ],
  'src/components/views/expenses': [
    'ExpenseManagerView.tsx',
    'ExpenseList.tsx',
    'ExpenseSummary.tsx',
    'ExpenseQuickActions.tsx',
    'ReceiptMatcher.tsx'
  ],
  'src/components/views/reports': [
    'ReportList.tsx',
    'ReportDetail.tsx',
    'ReportSummary.tsx',
    'CategoryBreakdown.tsx'
  ],
  'src/components/views/receipts': [
    'ReceiptUploader.tsx',
    'ReceiptGallery.tsx',
    'ReceiptDetail.tsx',
    'BatchUploader.tsx'
  ],
  'src/lib/services': [
    'teller.ts',
    'mindee.ts',
    'gmail.ts',
    'dropbox.ts',
    'openai.ts'
  ],
  'src/lib/hooks': [
    'useExpenses.ts',
    'useReceipts.ts',
    'useReports.ts',
    'useTeller.ts',
    'useGmail.ts'
  ],
  'app': [
    'layout.tsx',
    'page.tsx'
  ],
  'app/expenses': [
    'page.tsx'
  ],
  'app/reports': [
    'page.tsx',
    '[id]/page.tsx'
  ],
  'app/receipts': [
    'page.tsx',
    'upload/page.tsx'
  ],
  'app/settings': [
    'page.tsx',
    'connections/page.tsx',
    'profile/page.tsx'
  ]
};

// Add type for fs.Dirent
interface Dirent {
  isDirectory(): boolean;
  name: string;
}

console.log(chalk.blue('\n🔍 Verifying project structure...\n'));

let hasErrors = false;

// Check directories and files
Object.entries(REQUIRED_STRUCTURE).forEach(([dir, expectedFiles]) => {
  const fullPath = joinPath(process.cwd(), dir);
  
  if (!checkDirectory(fullPath)) {
    console.log(chalk.red(`❌ Missing directory: ${dir}`));
    hasErrors = true;
    return;
  }

  expectedFiles.forEach(file => {
    const filePath = joinPath(fullPath, file);
    if (!checkFile(filePath)) {
      console.log(chalk.red(`❌ Missing file: ${joinPath(dir, file)}`));
      hasErrors = true;
    }
  });
});

// Check imports
function checkImports(dir: string): void {
  const contents = readDirectory(dir, { withFileTypes: true }) as Dirent[];
  
  contents.forEach(item => {
    const fullPath = joinPath(dir, item.name);
    
    if (item.isDirectory()) {
      checkImports(fullPath);
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      const content = readFile(fullPath);
      if (content.includes('@/components/') && !content.includes('@/src/components/')) {
        console.log(chalk.yellow(`⚠️  Incorrect import path in: ${fullPath}`));
        hasErrors = true;
      }
    }
  });
}

checkImports(joinPath(process.cwd(), 'src'));

if (hasErrors) {
  console.log(chalk.red('\n❌ Verification failed! See errors above.\n'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All structure checks passed!\n'));
} 