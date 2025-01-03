import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as glob from 'glob';

interface ImportFix {
  from: RegExp;
  to: string | ((match: string, ...args: any[]) => string);
}

// Import path patterns to fix
const importFixPatterns: ImportFix[] = [
  // Fix src prefix in imports
  {
    from: /@\/src\/(components|lib|contexts|types)/g,
    to: '@/$1'
  },
  // Fix relative imports
  {
    from: /from ['"]\.\.\/src\/(components|lib|contexts|types)/g,
    to: "from '@/$1"
  },
  // Fix casing in UI component imports
  {
    from: /@\/components\/ui\/([a-z])/g,
    to: (_match: string, p1: string) => `@/components/ui/${p1.toUpperCase()}`
  },
  // Fix casing in specific component names
  {
    from: /ui\/(button|card|input|label|dialog|dropdown-menu|avatar|calendar|tabs|skeleton|progress|popover|textarea)/gi,
    to: (_match: string, p1: string) => `ui/${p1.charAt(0).toUpperCase()}${p1.slice(1).toLowerCase()}`
  },
  // Fix imports from src directory
  {
    from: /from ['"]src\//g,
    to: 'from "@/'
  },
  // Fix relative imports to src directory
  {
    from: /from ['"]\.\.\/\.\.\/src\//g,
    to: 'from "@/'
  },
  // Fix relative imports to components
  {
    from: /from ['"]\.\.\/\.\.\/components\//g,
    to: 'from "@/components/'
  },
  // Fix relative imports to lib
  {
    from: /from ['"]\.\.\/\.\.\/lib\//g,
    to: 'from "@/lib/'
  },
  // Fix relative imports to types
  {
    from: /from ['"]\.\.\/\.\.\/types\//g,
    to: 'from "@/types/'
  },
  // Fix relative imports to contexts
  {
    from: /from ['"]\.\.\/\.\.\/contexts\//g,
    to: 'from "@/contexts/'
  }
];

// File patterns to process
const filePatterns = [
  'src/**/*.{ts,tsx}',
  'app/**/*.{ts,tsx}'
];

// Get all files to process
const files = filePatterns.reduce((acc, pattern) => {
  return acc.concat(glob.sync(pattern));
}, [] as string[]);

let totalFixed = 0;
let filesModified = 0;

// Process each file
files.forEach(file => {
  const filePath = join(process.cwd(), file);
  let content = readFileSync(filePath, 'utf8');
  let hasChanges = false;
  let fixCount = 0;

  importFixPatterns.forEach(({ from, to }) => {
    if (typeof to === 'string') {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
        fixCount++;
      }
    } else {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
        fixCount++;
      }
    }
  });

  if (hasChanges) {
    writeFileSync(filePath, content);
    filesModified++;
    totalFixed += fixCount;
    console.log(`✓ Fixed ${fixCount} imports in ${file}`);
  }
});

console.log('\nSummary:');
console.log(`Files processed: ${files.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total fixes applied: ${totalFixed}`);

// Add the script to package.json scripts
try {
  const packageJsonPath = join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['fix-imports']) {
    packageJson.scripts['fix-imports'] = 'ts-node scripts/fix-imports.ts';
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('\n✓ Added fix-imports script to package.json');
  }
} catch (error) {
  if (error instanceof Error) {
    console.error('\n⚠️ Failed to update package.json:', error.message);
  } else {
    console.error('\n⚠️ Failed to update package.json:', error);
  }
} 