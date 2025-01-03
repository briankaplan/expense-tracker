const {
  fs,
  path,
  chalk,
  readFile,
  readDirectory,
  joinPath
} = require('./utils/fs-helpers');

const IMPORT_PATTERNS = {
  components: {
    pattern: /@\/src\/components\//,
    error: '@/components/',
    message: 'Components should be imported from @/src/components/'
  },
  lib: {
    pattern: /@\/src\/lib\//,
    error: '@/lib/',
    message: 'Lib modules should be imported from @/src/lib/'
  }
};

console.log(chalk.blue('\n🔍 Verifying imports...\n'));

let hasErrors = false;

function checkFile(filePath: string) {
  const content = readFile(filePath);
  
  Object.entries(IMPORT_PATTERNS).forEach(([name, { pattern, error, message }]) => {
    if (content.includes(error) && !content.includes(pattern)) {
      console.log(chalk.red(`❌ ${filePath}: ${message}`));
      hasErrors = true;
    }
  });
}

function walkDir(dir: string) {
  const files = readDirectory(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = joinPath(dir, file.name);
    if (file.isDirectory()) {
      walkDir(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      checkFile(fullPath);
    }
  });
}

walkDir('src');
walkDir('app');

if (hasErrors) {
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All imports are correct!\n'));
} 