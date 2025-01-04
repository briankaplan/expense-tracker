import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

interface ScriptDefinition {
  command: string;
  description: string;
  category: 'core' | 'verify' | 'nexus' | 'development' | 'maintenance';
  dependencies?: string[];
}

const SCRIPT_DEFINITIONS: { [key: string]: ScriptDefinition } = {
  // Core scripts
  'dev': { command: 'next dev', description: 'Start development server', category: 'core' },
  'build': { command: 'next build', description: 'Build production application', category: 'core' },
  'start': { command: 'next start', description: 'Start production server', category: 'core' },
  'lint': { command: 'next lint', description: 'Run linter', category: 'core' },

  // Verification scripts
  'verify': { command: 'ts-node --transpile-only scripts/verify-scripts.ts', description: 'Run basic verification', category: 'verify' },
  'verify:full': { command: 'npm run verify && npm run report:generate', description: 'Run full verification with report', category: 'verify' },
  'verify:structure': { command: 'ts-node --transpile-only scripts/verify-structure.ts', description: 'Verify project structure', category: 'verify' },
  'verify:imports': { command: 'ts-node --transpile-only scripts/verify-imports.ts', description: 'Verify imports', category: 'verify' },
  'verify:types': { command: 'ts-node --transpile-only scripts/verify-types.ts', description: 'Verify TypeScript types', category: 'verify' },
  'verify:components': { command: 'ts-node --transpile-only scripts/verify-components.ts', description: 'Verify React components', category: 'verify' },
  'verify:features': { command: 'ts-node --transpile-only scripts/verify-features.ts', description: 'Verify features', category: 'verify' },
  'verify:scripts': { command: 'ts-node --transpile-only scripts/verify-scripts.ts', description: 'Verify scripts', category: 'verify' },
  'verify:reference': { command: 'ts-node --transpile-only scripts/verify-reference.ts', description: 'Verify references', category: 'verify' },

  // Nexus scripts
  'nexus': { command: 'ts-node --transpile-only scripts/nexus.ts', description: 'Run Nexus command', category: 'nexus' },
  'n': { command: 'npm run nexus', description: 'Shorthand for nexus command', category: 'nexus' },
  'nexus:save': { command: 'ts-node --transpile-only scripts/nexus-snapshot.ts save', description: 'Save Nexus snapshot', category: 'nexus' },
  'nexus:load': { command: 'ts-node --transpile-only scripts/nexus-snapshot.ts load', description: 'Load Nexus snapshot', category: 'nexus' },
  'init:nexus': { command: 'ts-node --transpile-only scripts/init.ts', description: 'Initialize Nexus', category: 'nexus' },

  // Development scripts
  'dashboard': { command: 'ts-node --transpile-only scripts/enhanced-dashboard.ts', description: 'Open development dashboard', category: 'development' },
  'dashboard:watch': { command: 'nodemon --watch .session-state.json --watch .project-state.json scripts/dashboard.ts', description: 'Watch dashboard changes', category: 'development' },
  'analyze': { command: 'ts-node --transpile-only scripts/analyze-impact.ts', description: 'Analyze impact', category: 'development' },
  'analyze:scripts': { command: 'ts-node --transpile-only scripts/analyze-scripts.ts', description: 'Analyze scripts', category: 'development' },
  'deps': { command: 'npm outdated', description: 'Check dependencies', category: 'development' },
  'critical': { command: 'ts-node --transpile-only scripts/critical-path-monitor.ts', description: 'Monitor critical paths', category: 'development' },
  'test:generate': { command: 'ts-node --transpile-only scripts/generate-tests.ts', description: 'Generate test files', category: 'development' },
  'sync': { command: 'ts-node --transpile-only scripts/sync-manager.ts', description: 'Sync project state', category: 'development' },

  // Maintenance scripts
  'fix-imports': { command: 'ts-node scripts/fix-imports.ts', description: 'Fix imports', category: 'maintenance' },
  'migrate:scripts': { command: 'ts-node --transpile-only scripts/migrate-scripts.ts', description: 'Migrate scripts', category: 'maintenance' },
  'hooks:install': { command: 'ts-node --transpile-only scripts/hooks/git-hooks.ts install', description: 'Install Git hooks', category: 'maintenance' },
  'hooks:verify': { command: 'ts-node --transpile-only scripts/hooks/git-hooks.ts verify', description: 'Verify Git hooks', category: 'maintenance' },
  'session:save': { command: 'ts-node --transpile-only scripts/session-state.ts --save', description: 'Save session state', category: 'maintenance' },
  'session:load': { command: 'ts-node --transpile-only scripts/session-state.ts --load', description: 'Load session state', category: 'maintenance' },
  'recovery:create': { command: 'ts-node --transpile-only scripts/recovery-manager.ts create', description: 'Create recovery point', category: 'maintenance' },
  'recovery:list': { command: 'ts-node --transpile-only scripts/recovery-manager.ts list', description: 'List recovery points', category: 'maintenance' },
  'recovery:restore': { command: 'ts-node --transpile-only scripts/recovery-manager.ts restore', description: 'Restore from recovery point', category: 'maintenance' },
  'setup': { command: 'ts-node --transpile-only scripts/setup.ts', description: 'Set up project', category: 'maintenance' },
  'scripts:validate': { command: 'ts-node --transpile-only scripts/script-manager.ts validate', description: 'Validate script configuration', category: 'maintenance' },
  'scripts:update': { command: 'ts-node --transpile-only scripts/script-manager.ts update', description: 'Update script configuration', category: 'maintenance' },

  // Lifecycle scripts
  'precommit': { command: 'npm run verify:full && npm run analyze', description: 'Pre-commit hook', category: 'maintenance' },
  'postinstall': { command: 'npm run init:nexus', description: 'Post-install hook', category: 'maintenance' }
};

class ScriptManager {
  private packageJsonPath = path.join(process.cwd(), 'package.json');

  validateScripts(): void {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const currentScripts = packageJson.scripts || {};
      const missingScripts = [];
      const extraScripts = [];

      // Check for missing scripts
      for (const [name, def] of Object.entries(SCRIPT_DEFINITIONS)) {
        if (!currentScripts[name]) {
          missingScripts.push(name);
        }
      }

      // Check for extra scripts
      for (const name of Object.keys(currentScripts)) {
        if (!SCRIPT_DEFINITIONS[name]) {
          extraScripts.push(name);
        }
      }

      if (missingScripts.length > 0) {
        console.log(chalk.yellow('\nMissing scripts:'));
        missingScripts.forEach(name => {
          console.log(`  ${chalk.bold(name)}: ${SCRIPT_DEFINITIONS[name].description}`);
        });
      }

      if (extraScripts.length > 0) {
        console.log(chalk.yellow('\nExtra scripts:'));
        extraScripts.forEach(name => {
          console.log(`  ${chalk.bold(name)}`);
        });
      }

      if (missingScripts.length === 0 && extraScripts.length === 0) {
        console.log(chalk.green('\n✓ All scripts are properly configured'));
      }
    } catch (error) {
      console.error(chalk.red('\n✗ Failed to validate scripts:'), error);
      process.exit(1);
    }
  }

  updateScripts(): void {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      packageJson.scripts = {};

      // Add scripts by category
      const categories = ['core', 'verify', 'nexus', 'development', 'maintenance'] as const;
      
      for (const category of categories) {
        const categoryScripts = Object.entries(SCRIPT_DEFINITIONS)
          .filter(([_, def]) => def.category === category)
          .reduce((acc, [name, def]) => ({
            ...acc,
            [name]: def.command
          }), {});

        Object.assign(packageJson.scripts, categoryScripts);
      }

      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(chalk.green('\n✓ Scripts updated successfully'));
      
      // Show script categories
      console.log('\nScript categories:');
      for (const category of categories) {
        console.log(chalk.blue(`\n${category.toUpperCase()}:`));
        Object.entries(SCRIPT_DEFINITIONS)
          .filter(([_, def]) => def.category === category)
          .forEach(([name, def]) => {
            console.log(`  ${chalk.bold(name)}: ${def.description}`);
          });
      }
    } catch (error) {
      console.error(chalk.red('\n✗ Failed to update scripts:'), error);
      process.exit(1);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const manager = new ScriptManager();

if (args[0] === 'validate') {
  manager.validateScripts();
} else if (args[0] === 'update') {
  manager.updateScripts();
} else {
  console.error(chalk.red('\n✗ Invalid command. Use "validate" or "update"'));
  process.exit(1);
}

module.exports = {
  ScriptManager,
  SCRIPT_DEFINITIONS
}; 