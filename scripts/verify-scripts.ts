import { chalk, readFile, joinPath, checkFile } from './utils/fs-helpers';

const REQUIRED_SCRIPTS = {
  'package.json': [
    'dev',
    'build',
    'start',
    'lint',
    'test',
    'verify'
  ],
  'scripts/nexus.ts': [
    'dashboard',
    'status',
    'verify',
    'milestones',
    'alerts',
    'auto',
    'feature',
    'integration',
    'report',
    'sync',
    'tools',
    'help',
    'ai'
  ]
};

export async function verifyScripts(): Promise<void> {
  console.log(chalk.blue('\n🔍 Verifying script system...\n'));

  let hasErrors = false;

  Object.entries(REQUIRED_SCRIPTS).forEach(([file, requiredScripts]) => {
    const fullPath = joinPath(process.cwd(), file);
    
    if (!checkFile(fullPath)) {
      console.log(chalk.red(`❌ Missing file: ${file}`));
      hasErrors = true;
      return;
    }

    const content = readFile(fullPath);
    
    requiredScripts.forEach(script => {
      if (!content.includes(script)) {
        console.log(chalk.yellow(`⚠️  ${file} might be missing script: ${script}`));
        hasErrors = true;
      }
    });
  });

  if (hasErrors) {
    console.log(chalk.red('\n❌ Script system verification failed! See errors above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ Script system verified!\n'));
  }
} 