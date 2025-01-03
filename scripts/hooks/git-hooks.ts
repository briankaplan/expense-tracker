const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

const HOOK_SCRIPTS = {
  'post-commit': `
#!/bin/sh
# Run Nexus Brain after commits
npm run n brain
`,
  'pre-push': `
#!/bin/sh
# Run verifications before push
npm run verify
npm run verify:structure
npm run verify:imports
npm run verify:types
npm run verify:components
`,
  'post-merge': `
#!/bin/sh
# Check dependencies after merges
npm run n deps
npm run n brain
`,
  'post-checkout': `
#!/bin/sh
# Check project state after checkout
npm run n brain
`
};

class GitHooksManager {
  private hooksDir: string;

  constructor() {
    this.hooksDir = path.join(process.cwd(), '.git', 'hooks');
  }

  async installHooks() {
    console.log(chalk.blue('\n🔗 Installing Git Hooks\n'));

    // Ensure hooks directory exists
    if (!fs.existsSync(this.hooksDir)) {
      console.log(chalk.yellow('Creating hooks directory...'));
      fs.mkdirSync(this.hooksDir, { recursive: true });
    }

    // Install each hook
    for (const [hook, script] of Object.entries(HOOK_SCRIPTS)) {
      const hookPath = path.join(this.hooksDir, hook);
      
      // Write hook script
      fs.writeFileSync(hookPath, script);
      
      // Make executable
      fs.chmodSync(hookPath, '755');
      
      console.log(chalk.green(`✓ Installed ${hook} hook`));
    }

    console.log(chalk.blue('\n✨ Git hooks installed successfully!\n'));
  }

  verifyHooks() {
    console.log(chalk.blue('\n🔍 Verifying Git Hooks\n'));
    
    let allValid = true;

    for (const hook of Object.keys(HOOK_SCRIPTS)) {
      const hookPath = path.join(this.hooksDir, hook);
      
      if (!fs.existsSync(hookPath)) {
        console.log(chalk.red(`✗ Missing ${hook} hook`));
        allValid = false;
        continue;
      }

      // Check if executable
      try {
        fs.accessSync(hookPath, fs.constants.X_OK);
        console.log(chalk.green(`✓ ${hook} hook is valid`));
      } catch (error) {
        console.log(chalk.red(`✗ ${hook} hook is not executable`));
        allValid = false;
      }
    }

    return allValid;
  }
}

// Add to package.json scripts
const updatePackageJson = () => {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packagePath);

  packageJson.scripts = {
    ...packageJson.scripts,
    'hooks:install': 'ts-node --transpile-only scripts/hooks/git-hooks.ts install',
    'hooks:verify': 'ts-node --transpile-only scripts/hooks/git-hooks.ts verify'
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
};

// Run if called directly
if (require.main === module) {
  const manager = new GitHooksManager();
  const command = process.argv[2];

  if (command === 'install') {
    manager.installHooks().catch(error => {
      console.error(chalk.red('\n❌ Hook installation failed:'), error);
      process.exit(1);
    });
  } else if (command === 'verify') {
    const valid = manager.verifyHooks();
    if (!valid) {
      console.log(chalk.yellow('\nRun npm run hooks:install to fix issues'));
      process.exit(1);
    }
  } else {
    console.log(chalk.red('\n❌ Unknown command. Use install or verify'));
    process.exit(1);
  }
}

module.exports = {
  GitHooksManager
}; 