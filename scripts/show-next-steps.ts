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
  process.exit(1);
}

const REFERENCE_DIR = REFERENCE_PATHS[0];

// Core components we need to implement
const CORE_COMPONENTS = [
  {
    name: 'Layout Components',
    components: [
      {
        name: 'MainLayout',
        path: 'src/components/views/layout/MainLayout.tsx',
        dependencies: ['Header', 'Sidebar']
      },
      {
        name: 'Header',
        path: 'src/components/views/layout/Header.tsx',
        dependencies: ['Button', 'Avatar', 'ThemeToggle']
      },
      {
        name: 'Sidebar',
        path: 'src/components/views/layout/Sidebar.tsx',
        dependencies: ['NavLink']
      }
    ]
  },
  {
    name: 'Expense Components',
    components: [
      {
        name: 'ExpenseList',
        path: 'src/components/views/expenses/ExpenseList.tsx',
        dependencies: ['DataTable', 'Badge']
      },
      {
        name: 'ExpenseSummary',
        path: 'src/components/views/expenses/ExpenseSummary.tsx',
        dependencies: ['Card', 'Badge']
      }
    ]
  },
  {
    name: 'UI Components',
    components: [
      {
        name: 'Button',
        path: 'src/components/ui/Button.tsx',
        dependencies: []
      },
      {
        name: 'Card',
        path: 'src/components/ui/Card.tsx',
        dependencies: []
      },
      {
        name: 'Badge',
        path: 'src/components/ui/Badge.tsx',
        dependencies: []
      },
      {
        name: 'DataTable',
        path: 'src/components/ui/DataTable.tsx',
        dependencies: ['@tanstack/react-table']
      }
    ]
  }
];

console.log(chalk.blue('\n📋 Implementation Status:\n'));

CORE_COMPONENTS.forEach(group => {
  console.log(chalk.yellow(`\n${group.name}:`));
  
  group.components.forEach(({ name, path: componentPath, dependencies }) => {
    const currentPath = path.join(process.cwd(), componentPath);
    const refPath = path.join(REFERENCE_DIR, componentPath);
    
    if (!fs.existsSync(currentPath)) {
      console.log(chalk.red(`\n❌ Missing: ${name}`));
      console.log(chalk.gray(`  Path: ${componentPath}`));
      if (dependencies.length) {
        console.log(chalk.gray('  Dependencies:'));
        dependencies.forEach(dep => console.log(chalk.gray(`    - ${dep}`)));
      }
      
      if (fs.existsSync(refPath)) {
        console.log(chalk.green('  ✓ Reference available'));
      }
    } else {
      console.log(chalk.green(`✓ ${name}`));
    }
  });
});

console.log('\n'); 