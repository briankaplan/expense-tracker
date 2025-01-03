const { execSync } = require('child_process');
const { existsSync, mkdirSync, copyFileSync } = require('fs');
const { join } = require('path');

const REFERENCE_DIR = '../expense-analyzer-new';
const files = [
  // UI Components
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Input.tsx',
  
  // Layout Components
  'src/components/views/layout/Header.tsx',
  'src/components/views/layout/Sidebar.tsx',
  
  // Expense Components
  'src/components/views/expenses/ExpenseList.tsx',
  'src/components/views/expenses/ExpenseSummary.tsx',
  
  // Subscription Components
  'src/components/views/subscriptions/SubscriptionCard.tsx'
];

files.forEach(file => {
  const sourcePath = join(REFERENCE_DIR, file);
  const targetPath = join(process.cwd(), file);
  const targetDir = targetPath.split('/').slice(0, -1).join('/');

  if (existsSync(sourcePath)) {
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    copyFileSync(sourcePath, targetPath);
    console.log(`✓ Copied ${file}`);
  } else {
    console.error(`× Reference file not found: ${file}`);
  }
}); 