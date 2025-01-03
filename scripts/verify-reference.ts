const {
  chalk,
  checkDirectory,
  checkFile,
  joinPath
} = require('./utils/fs-helpers');

const REFERENCE_PATHS = [
  './reference',
  '../expense-analyzer-new',
  '../expense-analyzer'
].filter(dir => checkDirectory(dir));

if (REFERENCE_PATHS.length === 0) {
  console.log(chalk.red('\n❌ No reference implementation found!\n'));
  process.exit(1);
}

const REFERENCE_DIR = REFERENCE_PATHS[0];
console.log(chalk.blue(`\n📂 Using reference from: ${REFERENCE_DIR}\n`));

const REQUIRED_REFERENCE_FILES = [
  'src/components/views/layout/AppShell.tsx',
  'src/components/views/expenses/ExpenseManagerView.tsx',
  'src/components/views/subscriptions/SubscriptionsView.tsx',
  'app/expenses/page.tsx',
  'app/upload/layout.tsx'
];

let hasErrors = false;

REQUIRED_REFERENCE_FILES.forEach(file => {
  const refPath = joinPath(REFERENCE_DIR, file);
  if (!checkFile(refPath)) {
    console.log(chalk.red(`❌ Missing reference file: ${file}`));
    hasErrors = true;
  } else {
    console.log(chalk.green(`✓ Found reference: ${file}`));
  }
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All reference files present!\n'));
}