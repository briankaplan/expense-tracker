import { NexusAutoFix } from '../core/NexusAutoFix';
import { AutoFixConfig } from '../types/autofix';
import chalk from 'chalk';

async function runAutoFixExample() {
  // Custom configuration
  const config: AutoFixConfig = {
    backupDir: '.nexus/backups',
    maxBackups: 5,
    structure: {
      'src/components/ui': ['Button.tsx', 'Card.tsx', 'Input.tsx', 'Select.tsx'],
      'src/components/views': ['dashboard', 'settings', 'receipts'],
      'src/lib': ['utils', 'hooks', 'api', 'db'],
      'src/types': ['index.ts', 'api.ts', 'components.ts'],
      'src/styles': ['globals.css', 'components.css'],
      'public': ['assets', 'icons', 'images']
    },
    ignorePaths: ['node_modules', '.git', '.next', 'dist']
  };

  try {
    console.log(chalk.blue('\n🚀 Starting AutoFix Example...\n'));

    // Initialize NexusAutoFix
    const autoFix = new NexusAutoFix(config);

    // Set up event listeners
    autoFix.on('fix-applied', (result) => {
      console.log(chalk.green('\n✅ Fix applied successfully:'));
      console.log(result.changes.map(change => `  - ${change}`).join('\n'));
    });

    autoFix.on('fix-failed', (result) => {
      console.log(chalk.red('\n❌ Fix failed:'));
      console.log(result.errors?.map(error => `  - ${error}`).join('\n'));
    });

    autoFix.on('backup-created', ({ path }) => {
      console.log(chalk.blue(`\n📦 Created backup at: ${path}`));
    });

    autoFix.on('backup-restored', ({ path }) => {
      console.log(chalk.yellow(`\n⚠️  Restored from backup: ${path}`));
    });

    autoFix.on('verification-complete', ({ success }) => {
      console.log(chalk.green('\n✨ Verification completed successfully'));
    });

    autoFix.on('verification-failed', ({ error }) => {
      console.log(chalk.red('\n❌ Verification failed:'), error);
    });

    // Initialize the system
    await autoFix.initialize();

    // Run the auto-fix process
    await autoFix.runAutoFix();

    console.log(chalk.green('\n✨ AutoFix Example completed successfully!\n'));
  } catch (error) {
    console.error(chalk.red('\n❌ AutoFix Example failed:'), error);
    process.exit(1);
  }
}

// Run the example if this script is executed directly
if (require.main === module) {
  runAutoFixExample().catch(console.error);
} 