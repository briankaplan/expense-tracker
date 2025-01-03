import { chalk, readFile, joinPath } from './utils/fs-helpers';

const REQUIRED_TYPES = {
  'src/types/reports.ts': [
    'ReportType',
    'ReportStatus',
    'SortField',
    'SortDirection',
    'ReportExpense',
    'Report',
    'ReportFilters',
    'ReportSort',
    'ReceiptMatch'
  ],
  'src/types/expenses.ts': [
    'Expense',
    'ExpenseStatus'
  ],
  'src/contexts/ReportsContext.tsx': [
    'ReportsContextType',
    'ReportsProvider',
    'useReports'
  ]
};

export async function verifyTypes(): Promise<void> {
  console.log(chalk.blue('\n🔍 Verifying type definitions...\n'));

  let hasErrors = false;

  Object.entries(REQUIRED_TYPES).forEach(([file, types]) => {
    const filePath = joinPath(process.cwd(), file);
    const content = readFile(filePath);

    types.forEach(type => {
      if (!content.includes(type)) {
        console.log(chalk.red(`❌ Missing type definition: ${type} in ${file}`));
        hasErrors = true;
      }
    });
  });

  if (hasErrors) {
    console.log(chalk.red('\n❌ Type verification failed! See errors above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All type definitions verified!\n'));
  }
} 