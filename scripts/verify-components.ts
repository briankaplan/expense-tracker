const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COMPONENTS = {
  'Button': {
    path: 'src/components/ui/Button.tsx',
    required: ['buttonVariants', 'Slot', 'cva']
  },
  'Card': {
    path: 'src/components/ui/Card.tsx',
    required: ['Card', 'CardHeader', 'CardFooter', 'CardTitle', 'CardDescription', 'CardContent']
  },
  'Badge': {
    path: 'src/components/ui/Badge.tsx',
    required: ['badgeVariants', 'cva']
  },
  'DataTable': {
    path: 'src/components/ui/DataTable.tsx',
    required: ['useReactTable', 'getCoreRowModel', 'Button']
  },
  'Avatar': {
    path: 'src/components/ui/Avatar.tsx',
    required: ['AvatarPrimitive', 'Avatar.Image', 'Avatar.Fallback']
  },
  'DropdownMenu': {
    path: 'src/components/ui/DropdownMenu.tsx',
    required: ['DropdownMenuPrimitive', 'DropdownMenuContent', 'DropdownMenuItem']
  },
  'ThemeToggle': {
    path: 'src/components/ui/ThemeToggle.tsx',
    required: ['useTheme', 'Button', 'Sun', 'Moon']
  },
  'ThemeProvider': {
    path: 'src/components/providers/ThemeProvider.tsx',
    required: ['NextThemesProvider', 'ThemeProviderProps']
  }
};

console.log(chalk.blue('\n🔍 Verifying components...\n'));

let hasErrors = false;

Object.entries(COMPONENTS).forEach(([name, { path: componentPath, required }]) => {
  const fullPath = path.join(process.cwd(), componentPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`❌ Missing component: ${name}`));
    hasErrors = true;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  required.forEach(req => {
    if (!content.includes(req)) {
      console.log(chalk.yellow(`⚠️  ${name} might be missing ${req}`));
      hasErrors = true;
    }
  });

  console.log(chalk.green(`✓ ${name} verified`));
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All components verified!\n'));
} 