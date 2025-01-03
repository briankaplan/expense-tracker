const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const REFERENCE_PATHS = [
  './reference',
  '../expense-analyzer-new',
  '../expense-analyzer'
].filter(dir => fs.existsSync(dir));

if (REFERENCE_PATHS.length === 0) {
  console.log(chalk.red('\n❌ No reference implementation found!\n'));
  console.log(chalk.yellow('Please ensure one of these directories exists:'));
  console.log('- ./reference');
  console.log('- ../expense-analyzer-new');
  console.log('- ../expense-analyzer');
  process.exit(1);
}

const REFERENCE_DIR = REFERENCE_PATHS[0];
console.log(chalk.blue(`\n📂 Using reference from: ${REFERENCE_DIR}\n`));

const CRITICAL_FILES = [
  'app/layout.tsx',
  'app/expenses/page.tsx',
  'app/upload/layout.tsx',
  'src/components/views/layout/AppShell.tsx',
  'src/components/views/expenses/ExpenseManagerView.tsx',
  'src/components/views/subscriptions/SubscriptionsView.tsx'
];

let hasErrors = false;

CRITICAL_FILES.forEach(file => {
  const refPath = path.join(REFERENCE_DIR, file);
  const currentPath = path.join(process.cwd(), file);

  if (!fs.existsSync(refPath)) {
    console.log(chalk.yellow(`⚠️  Reference file not found: ${file}`));
    return;
  }

  if (!fs.existsSync(currentPath)) {
    console.log(chalk.red(`❌ Implementation missing: ${file}`));
    hasErrors = true;
    return;
  }

  console.log(chalk.green(`✓ ${file} exists`));
});

if (hasErrors) {
  console.log(chalk.red('\n❌ Some files need attention!\n'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All critical files present!\n'));
} 