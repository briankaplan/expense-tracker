import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as glob from 'glob';

const files = glob.sync('{src,app}/**/*.{ts,tsx}');

const importMappings = [
  {
    from: /@\/components\//g,
    to: '@/src/components/'
  },
  {
    from: /@\/lib\//g,
    to: '@/src/lib/'
  }
];

files.forEach(file => {
  const filePath = join(process.cwd(), file);
  let content = readFileSync(filePath, 'utf8');
  let hasChanges = false;

  importMappings.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    writeFileSync(filePath, content);
    console.log(`Updated imports in: ${file}`);
  }
}); 