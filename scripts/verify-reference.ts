import { chalk, readFile, joinPath, checkFile } from './utils/fs-helpers';

interface APIReference {
  name: string;
  type: 'component' | 'hook' | 'utility' | 'context';
  file: string;
  exports: string[];
  props?: string[];
}

const API_REFERENCES: APIReference[] = [
  {
    name: 'Button',
    type: 'component',
    file: 'src/components/ui/Button.tsx',
    exports: ['Button', 'buttonVariants'],
    props: ['variant', 'size', 'asChild']
  },
  {
    name: 'useAuth',
    type: 'hook',
    file: 'src/lib/hooks/useAuth.ts',
    exports: ['useAuth'],
    props: ['user', 'signIn', 'signOut', 'loading']
  },
  {
    name: 'ReportsContext',
    type: 'context',
    file: 'src/contexts/ReportsContext.tsx',
    exports: ['ReportsProvider', 'useReports'],
    props: ['reports', 'activeReport', 'filters', 'sort']
  }
];

export async function verifyReference(): Promise<void> {
  console.log(chalk.blue('\n🔍 Verifying API references...\n'));

  let hasErrors = false;

  API_REFERENCES.forEach(({ name, type, file, exports, props }) => {
    console.log(chalk.blue(`\nChecking ${type} ${name}:`));
    
    const fullPath = joinPath(process.cwd(), file);
    if (!checkFile(fullPath)) {
      console.log(chalk.red(`  ❌ Missing file: ${file}`));
      hasErrors = true;
      return;
    }

    const content = readFile(fullPath);
    
    exports.forEach(exp => {
      if (!content.includes(`export ${exp}`) && !content.includes(`export { ${exp} }`)) {
        console.log(chalk.yellow(`  ⚠️  Missing export: ${exp}`));
        hasErrors = true;
      }
    });

    if (props) {
      props.forEach(prop => {
        if (!content.includes(prop)) {
          console.log(chalk.yellow(`  ⚠️  Missing prop or type: ${prop}`));
          hasErrors = true;
        }
      });
    }
  });

  if (hasErrors) {
    console.log(chalk.red('\n❌ API reference verification failed! See errors above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All API references verified!\n'));
  }
}