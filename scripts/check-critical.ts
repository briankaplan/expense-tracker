const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const REFERENCE_DIR = '../expense-analyzer-new';
const CRITICAL_PAIRS = [
  {
    file: 'app/layout.tsx',
    exports: ['metadata', 'default'],
    components: ['AppShell']
  },
  {
    file: 'app/expenses/page.tsx',
    exports: ['metadata', 'default'],
    components: ['ExpenseManagerView']
  },
  {
    file: 'app/upload/layout.tsx',
    exports: ['default'],
    components: []
  },
  {
    file: 'src/components/views/layout/AppShell.tsx',
    exports: ['AppShell'],
    components: ['MainLayout', 'AuthProvider', 'QueryProvider']
  }
];

console.log(chalk.blue('\n🔍 Checking critical file implementations...\n'));

let hasErrors = false;

CRITICAL_PAIRS.forEach(({ file, exports, components }) => {
  const refPath = path.join(REFERENCE_DIR, file);
  const currentPath = path.join(process.cwd(), file);

  if (!fs.existsSync(currentPath)) {
    console.log(chalk.red(`❌ Missing implementation: ${file}`));
    hasErrors = true;
    return;
  }

  const content = fs.readFileSync(currentPath, 'utf8');

  // Check exports
  exports.forEach(exp => {
    if (!content.includes(`export ${exp === 'default' ? 'default' : 'const'} ${exp}`)) {
      console.log(chalk.red(`❌ Missing export '${exp}' in ${file}`));
      hasErrors = true;
    }
  });

  // Check component imports
  components.forEach(comp => {
    if (!content.includes(comp)) {
      console.log(chalk.red(`❌ Missing component '${comp}' in ${file}`));
      hasErrors = true;
    }
  });

  console.log(chalk.green(`✓ ${file} implementation verified`));
});

if (hasErrors) {
  console.log(chalk.red('\n❌ Some implementations need attention!\n'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All critical implementations verified!\n'));
} 