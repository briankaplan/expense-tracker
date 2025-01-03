import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');
export const OLD_SCRIPTS_DIR = path.join(SCRIPTS_DIR, 'old');

export const scriptsToMove = [
  'cleanup.ts',
  'move-files.ts',
  'verify-structure.ts',
  'verify-imports.ts',
  'verify-cleanup.ts',
  'check-integration.ts',
  'check-critical.ts',
  'compare-with-reference.ts',
  'copy-from-reference.ts',
  'check-reference.ts',
  'verify-components.ts',
  'check-implementation.ts',
  'verify-types.ts',
  'track-development.ts',
  'verify-features.ts',
  'show-next-steps.ts',
  'setup-hooks.ts'
];

export interface MigrationResult {
  success: boolean;
  migratedScripts: string[];
  errors: string[];
}

export async function migrateScripts(): Promise<MigrationResult> {
  console.log(chalk.blue('\n📦 Migrating old scripts\n'));

  const result: MigrationResult = {
    success: true,
    migratedScripts: [],
    errors: []
  };

  try {
    // Create old scripts directory if it doesn't exist
    if (!fs.existsSync(OLD_SCRIPTS_DIR)) {
      fs.mkdirSync(OLD_SCRIPTS_DIR, { recursive: true });
    }

    // Move each script
    for (const script of scriptsToMove) {
      const oldPath = path.join(SCRIPTS_DIR, script);
      const newPath = path.join(OLD_SCRIPTS_DIR, script);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        result.migratedScripts.push(script);
        console.log(chalk.green(`✓ Migrated ${script}`));
      }
    }

    console.log(chalk.green('\n✨ Scripts migration completed successfully!\n'));
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
    console.error(chalk.red('✗ Scripts migration failed:'), error.message);
  }

  return result;
} 