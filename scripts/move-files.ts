const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const moves = [
  // UI Components
  ['src/components/ui/Button.tsx', 'src/components/ui/'],
  ['src/components/ui/Card.tsx', 'src/components/ui/'],
  ['src/components/ui/Input.tsx', 'src/components/ui/'],
  
  // Layout Components
  ['src/components/views/layout/AppShell.tsx', 'src/components/views/layout/'],
  ['src/components/views/layout/Header.tsx', 'src/components/views/layout/'],
  ['src/components/views/layout/Sidebar.tsx', 'src/components/views/layout/'],
  
  // Expense Components
  ['src/components/views/expenses/ExpenseList.tsx', 'src/components/views/expenses/'],
  ['src/components/views/expenses/ExpenseSummary.tsx', 'src/components/views/expenses/'],
  ['src/components/views/expenses/ExpenseManagerView.tsx', 'src/components/views/expenses/']
];

moves.forEach(([from, to]) => {
  const sourcePath = join(process.cwd(), from);
  if (existsSync(sourcePath)) {
    try {
      execSync(`mkdir -p ${to}`);
      execSync(`mv ${from} ${to}`);
      console.log(`✓ Moved ${from} to ${to}`);
    } catch (error) {
      console.error(`Error moving ${from} to ${to}`);
    }
  } else {
    console.log(`Skipping ${from} - file doesn't exist`);
  }
}); 