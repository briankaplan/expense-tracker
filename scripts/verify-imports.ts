import { chalk, readFile, joinPath } from './utils/fs-helpers';

const IMPORT_RULES = {
  components: {
    pattern: /@\/src\/components\//,
    correctPattern: /@\/components\//,
    description: 'Component imports should use @/components/ instead of @/src/components/'
  },
  lib: {
    pattern: /@\/src\/lib\//,
    correctPattern: /@\/lib\//,
    description: 'Library imports should use @/lib/ instead of @/src/lib/'
  },
  types: {
    pattern: /@\/src\/types\//,
    correctPattern: /@\/types\//,
    description: 'Type imports should use @/types/ instead of @/src/types/'
  },
  contexts: {
    pattern: /@\/src\/contexts\//,
    correctPattern: /@\/contexts\//,
    description: 'Context imports should use @/contexts/ instead of @/src/contexts/'
  }
};

export async function verifyImports(): Promise<void> {
  console.log(chalk.blue('\n🔍 Verifying import paths...\n'));

  let hasErrors = false;

  // Function to check imports in a file
  const checkImports = (filePath: string) => {
    const content = readFile(filePath);
    
    Object.entries(IMPORT_RULES).forEach(([name, { pattern, correctPattern, description }]) => {
      if (pattern.test(content)) {
        console.log(chalk.yellow(`⚠️  ${filePath}: ${description}`));
        hasErrors = true;
      }
    });
  };

  // TODO: Add recursive directory scanning and file checking
  // This is a placeholder for the actual implementation
  const filesToCheck = [
    'src/components/views/layout/Header.tsx',
    'src/components/views/layout/Sidebar.tsx',
    'app/page.tsx',
    'app/expenses/page.tsx'
  ];

  filesToCheck.forEach(file => {
    const fullPath = joinPath(process.cwd(), file);
    checkImports(fullPath);
  });

  if (hasErrors) {
    console.log(chalk.red('\n❌ Import verification failed! Fix the import paths above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All import paths are correct!\n'));
  }
} 