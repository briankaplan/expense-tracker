const { existsSync, readdirSync, readFileSync } = require('fs');
const { join } = require('path');
const chalk = require('chalk');

// Files we've implemented so far
const IMPLEMENTED_FILES = {
  'src/components/views/layout': [
    {
      name: 'AppShell.tsx',
      required: ['MainLayout', 'AuthProvider', 'QueryProvider']
    }
  ],
  'src/components/views/expenses': [
    {
      name: 'ExpenseManagerView.tsx',
      required: ['ExpenseList', 'ExpenseSummary']
    }
  ],
  'app': [
    {
      name: 'layout.tsx',
      required: ['AppShell', 'metadata']
    },
    {
      name: 'page.tsx',
      required: []
    }
  ],
  'app/expenses': [
    {
      name: 'page.tsx',
      required: ['ExpenseManagerView', 'metadata']
    }
  ],
  'app/upload': [
    {
      name: 'layout.tsx',
      required: []
    }
  ]
};

console.log(chalk.blue('\n🔍 Checking implemented files...\n'));

let hasErrors = false;

Object.entries(IMPLEMENTED_FILES).forEach(([dir, files]) => {
  console.log(chalk.yellow(`\nChecking ${dir}...`));
  
  const fullPath = join(process.cwd(), dir);
  if (!existsSync(fullPath)) {
    console.log(chalk.red(`❌ Directory missing: ${dir}`));
    hasErrors = true;
    return;
  }

  files.forEach(({ name, required }) => {
    const filePath = join(fullPath, name);
    if (!existsSync(filePath)) {
      console.log(chalk.red(`❌ File missing: ${name}`));
      hasErrors = true;
      return;
    }

    const content = readFileSync(filePath, 'utf8');
    required.forEach(req => {
      if (!content.includes(req)) {
        console.log(chalk.yellow(`⚠️  ${name} might be missing ${req}`));
        hasErrors = true;
      }
    });

    console.log(chalk.green(`✓ ${name} verified`));
  });
});

if (hasErrors) {
  console.log(chalk.red('\n❌ Integration check failed! See above.\n'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All implemented files are properly integrated!\n'));
} 