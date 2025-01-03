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

const CORE_COMPONENTS = [
  {
    name: 'Layout',
    files: [
      'src/components/views/layout/AppShell.tsx',
      'src/components/views/layout/Header.tsx',
      'src/components/views/layout/Sidebar.tsx'
    ]
  },
  {
    name: 'UI',
    files: [
      'src/components/ui/Button.tsx',
      'src/components/ui/Card.tsx',
      'src/components/ui/Badge.tsx',
      'src/components/ui/DataTable.tsx'
    ]
  },
  {
    name: 'Features',
    files: [
      'src/components/views/expenses/ExpenseManagerView.tsx',
      'src/components/views/expenses/ExpenseList.tsx',
      'src/components/views/expenses/ExpenseSummary.tsx'
    ]
  }
];

console.log(chalk.blue('\n🔍 Checking implementation status...\n'));

let hasErrors = false;

CORE_COMPONENTS.forEach(({ name, files }) => {
  console.log(chalk.yellow(`\n${name}:`));
  
  files.forEach(file => {
    const currentPath = joinPath(process.cwd(), file);
    const refPath = joinPath(REFERENCE_DIR, file);
    
    if (!checkFile(currentPath)) {
      console.log(chalk.red(`❌ Missing: ${file}`));
      hasErrors = true;
      return;
    }

    if (!checkFile(refPath)) {
      console.log(chalk.yellow(`⚠️  No reference for: ${file}`));
    }

    console.log(chalk.green(`✓ ${file}`));
  });
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All core components implemented!\n'));
} 