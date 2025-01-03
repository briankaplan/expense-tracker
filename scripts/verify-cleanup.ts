import {
  chalk,
  checkDirectory,
  checkFile,
  readDirectory,
  readFile,
  joinPath
} from './utils/fs-helpers';

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
    'Dialog.tsx',
    'Label.tsx',
    'DatePicker.tsx',
    'Calendar.tsx',
    'Popover.tsx',
    'Select.tsx'
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
  'src/components/views/expenses': [
    'ExpenseManagerView.tsx',
    'ExpenseList.tsx',
    'ExpenseSummary.tsx'
  ],
  'src/components/views/reports': [
    'ReportsView.tsx',
    'ReportList.tsx',
    'OpenReport.tsx',
    'ReportCard.tsx',
    'ReportDetails.tsx',
    'ReceiptMatcher.tsx',
    'BatchUploader.tsx'
  ],
  'src/contexts': [
    'ReportsContext.tsx'
  ],
  'src/types': [
    'expenses.ts',
    'reports.ts',
    'receipts.ts'
  ],
  'src/lib': [
    'utils/index.ts'
  ],
  'app': [
    'layout.tsx',
    'page.tsx'
  ],
  'app/expenses': [
    'page.tsx'
  ],
  'app/upload': [
    'layout.tsx',
    'page.tsx'
  ],
  'app/reports': [
    'page.tsx',
    'layout.tsx'
  ]
};

interface Dirent {
  isDirectory(): boolean;
  name: string;
}

console.log(chalk.blue('\n🔍 Verifying project structure...\n'));

export async function verifyCleanup(): Promise<void> {
  let hasErrors = false;

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

  function checkImports(dir: string): void {
    const contents = readDirectory(dir, { withFileTypes: true }) as Dirent[];
    
    contents.forEach(item => {
      const fullPath = joinPath(dir, item.name);
      
      if (item.isDirectory()) {
        checkImports(fullPath);
      } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
        const content = readFile(fullPath);
        
        // Check for incorrect import paths
        const incorrectPatterns = [
          /@\/src\//,                    // @/src/ prefix
          /from ['"]\.\.\/src\//,        // relative path to src
          /from ['"]src\//,              // direct src import
          /from ['"]\.\.\/\.\.\/src\//,  // deep relative path to src
          /from ['"]@\/components\/ui\/[a-z]/  // lowercase UI component names
        ];

        for (const pattern of incorrectPatterns) {
          if (pattern.test(content)) {
            console.log(chalk.yellow(`⚠️  Incorrect import path in: ${fullPath}`));
            hasErrors = true;
            break;
          }
        }
      }
    });
  }

  checkImports(joinPath(process.cwd(), 'src'));
  checkImports(joinPath(process.cwd(), 'app'));

  if (hasErrors) {
    console.log(chalk.red('\n❌ Verification failed! See errors above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All structure checks passed!\n'));
  }
} 