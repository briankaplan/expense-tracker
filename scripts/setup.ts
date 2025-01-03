import chalk from 'chalk';
import { execSync } from 'child_process';
import { recoveryManager } from './recovery-manager';
import { stateSync } from './sync-manager';
import { projectState } from './state/project-state';

export interface SetupResult {
  success: boolean;
  error?: string;
  verificationPassed: boolean;
  recoveryPointCreated: boolean;
}

export async function setup(): Promise<SetupResult> {
  console.log(chalk.blue('\n🚀 Initializing Project\n'));

  const result: SetupResult = {
    success: true,
    verificationPassed: false,
    recoveryPointCreated: false
  };

  try {
    // Initialize state systems
    await recoveryManager.initialize();
    stateSync.start();

    // Run initial verification
    console.log(chalk.yellow('\nRunning initial verification...'));
    execSync('npm run verify', { stdio: 'inherit' });
    result.verificationPassed = true;

    // Generate initial recovery point
    await recoveryManager.createRecoveryPoint('manual');
    result.recoveryPointCreated = true;

    console.log(chalk.green('\n✅ Setup complete! Starting dashboard...\n'));
    execSync('npm run dashboard', { stdio: 'inherit' });
  } catch (error) {
    result.success = false;
    result.error = error.message;
    console.error(chalk.red('\n❌ Setup failed:'), error);
  }

  return result;
}

if (require.main === module) {
  setup().catch(error => {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  });
} 