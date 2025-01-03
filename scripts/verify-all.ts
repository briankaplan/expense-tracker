import { chalk } from './utils/fs-helpers';
import { verifyStructure } from './verify-structure';
import { verifyCleanup } from './verify-cleanup';
import { verifyTypes } from './verify-types';
import { verifyComponents } from './verify-components';
import { verifyFeatures } from './verify-features';
import { verifyImports } from './verify-imports';
import { verifyScripts } from './verify-scripts';
import { verifyReference } from './verify-reference';

interface VerificationStep {
  name: string;
  verify: () => Promise<void>;
  critical: boolean;
}

const VERIFICATIONS: VerificationStep[] = [
  { name: 'Project Structure', verify: verifyStructure, critical: true },
  { name: 'Code Cleanup', verify: verifyCleanup, critical: false },
  { name: 'Type Definitions', verify: verifyTypes, critical: true },
  { name: 'UI Components', verify: verifyComponents, critical: true },
  { name: 'Feature Implementation', verify: verifyFeatures, critical: true },
  { name: 'Import Paths', verify: verifyImports, critical: false },
  { name: 'Script System', verify: verifyScripts, critical: false },
  { name: 'API Reference', verify: verifyReference, critical: false }
];

export async function verifyAll(): Promise<void> {
  console.log(chalk.blue('\n🔍 Running all verifications...\n'));
  
  let hasErrors = false;
  let criticalErrors = false;

  for (const { name, verify, critical } of VERIFICATIONS) {
    try {
      console.log(chalk.blue(`\n📋 Running ${name} verification...\n`));
      await verify();
      console.log(chalk.green(`✅ ${name} verification passed!\n`));
    } catch (error) {
      hasErrors = true;
      if (critical) criticalErrors = true;
      console.error(chalk.red(`❌ ${name} verification failed:`), error);
    }
  }

  if (criticalErrors) {
    console.error(chalk.red('\n❌ Critical verifications failed! Fix these issues before proceeding.\n'));
    process.exit(1);
  } else if (hasErrors) {
    console.warn(chalk.yellow('\n⚠️  Some non-critical verifications failed. Review warnings above.\n'));
  } else {
    console.log(chalk.green('\n✅ All verifications passed!\n'));
  }
}

// Run if called directly
if (require.main === module) {
  verifyAll().catch(error => {
    console.error(chalk.red('\n❌ Verification failed:'), error);
    process.exit(1);
  });
} 