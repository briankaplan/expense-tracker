import { chalk, readFile, joinPath, checkFile } from './utils/fs-helpers';

const FEATURES = {
  'ExpenseManager': {
    files: [
      'src/components/views/expenses/ExpenseManagerView.tsx',
      'src/components/views/expenses/ExpenseList.tsx',
      'src/components/views/expenses/ExpenseSummary.tsx'
    ],
    required: ['addExpense', 'updateExpense', 'deleteExpense', 'filterExpenses']
  },
  'Reports': {
    files: [
      'src/components/views/reports/ReportsView.tsx',
      'src/components/views/reports/ReportList.tsx'
    ],
    required: ['generateReport', 'exportReport', 'filterReports']
  },
  'Authentication': {
    files: [
      'src/lib/auth/index.ts',
      'src/components/views/auth/LoginForm.tsx'
    ],
    required: ['signIn', 'signOut', 'useAuth']
  }
};

export async function verifyFeatures(): Promise<void> {
  console.log(chalk.blue('\n🔍 Verifying features...\n'));

  let hasErrors = false;

  Object.entries(FEATURES).forEach(([name, { files, required }]) => {
    console.log(chalk.blue(`\nChecking ${name} feature:`));

    files.forEach(file => {
      const fullPath = joinPath(process.cwd(), file);
      
      if (!checkFile(fullPath)) {
        console.log(chalk.red(`  ❌ Missing file: ${file}`));
        hasErrors = true;
        return;
      }

      const content = readFile(fullPath);
      required.forEach(req => {
        if (!content.includes(req)) {
          console.log(chalk.yellow(`  ⚠️  ${file} might be missing ${req}`));
          hasErrors = true;
        }
      });
    });
  });

  if (hasErrors) {
    console.log(chalk.red('\n❌ Feature verification failed! See errors above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All features verified!\n'));
  }
} 