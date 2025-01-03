const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const REFERENCE_DIR = '../expense-analyzer-new';
const CURRENT_DIR = process.cwd();

const CRITICAL_FILES = [
  'app/layout.tsx',
  'app/expenses/page.tsx',
  'app/upload/layout.tsx',
  'src/components/views/layout/AppShell.tsx',
  'src/components/views/expenses/ExpenseManagerView.tsx',
  'src/components/views/subscriptions/SubscriptionsView.tsx'
];

console.log(chalk.blue('\n🔍 Comparing with reference implementation...\n'));

let hasErrors = false;

// Check each critical file
CRITICAL_FILES.forEach(file => {
  const refPath = path.join(REFERENCE_DIR, file);
  const currentPath = path.join(CURRENT_DIR, file);

  console.log(chalk.yellow(`\nChecking ${file}...`));

  // Check if file exists in both places
  if (!fs.existsSync(refPath)) {
    console.log(chalk.red(`❌ Reference file missing: ${file}`));
    hasErrors = true;
    return;
  }

  if (!fs.existsSync(currentPath)) {
    console.log(chalk.red(`❌ Implementation missing: ${file}`));
    hasErrors = true;
    return;
  }

  // Compare file contents
  const refContent = fs.readFileSync(refPath, 'utf8');
  const currentContent = fs.readFileSync(currentPath, 'utf8');

  // Check imports
  const refImports = refContent.match(/^import.*from.*/gm) || [];
  const currentImports = currentContent.match(/^import.*from.*/gm) || [];

  const missingImports = refImports.filter(imp => 
    !currentImports.some(cImp => cImp.includes(imp.split('from')[1]))
  );

  if (missingImports.length) {
    console.log(chalk.yellow('⚠️  Missing imports:'));
    missingImports.forEach(imp => console.log(chalk.yellow(`   ${imp}`)));
  }

  // Check for 'use client' directive
  if (file.includes('components/') && !currentContent.includes('use client')) {
    console.log(chalk.yellow(`⚠️  Missing 'use client' directive`));
  }

  console.log(chalk.green(`✓ ${file} checked`));
});

if (hasErrors) {
  console.log(chalk.red('\n❌ Some files need attention! See above.\n'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All critical files match reference structure!\n'));
} 