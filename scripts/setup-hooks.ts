const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const HOOKS_DIR = '.git/hooks';
const PRE_COMMIT_HOOK = `#!/bin/sh
# Run our dependency impact analysis
npm run verify:safe || exit 1
`;

function setupGitHooks() {
  console.log(chalk.blue('\n🔧 Setting up Git hooks...\n'));

  const preCommitPath = path.join(process.cwd(), HOOKS_DIR, 'pre-commit');
  
  try {
    fs.writeFileSync(preCommitPath, PRE_COMMIT_HOOK);
    fs.chmodSync(preCommitPath, '755');
    console.log(chalk.green('✅ Git hooks installed successfully!\n'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to install Git hooks:'), error);
    process.exit(1);
  }
}

setupGitHooks(); 