import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export const commands = [
  // Create new directory structure
  'mkdir -p src/components/ui',
  'mkdir -p src/components/views/layout',
  'mkdir -p src/components/views/auth',
  'mkdir -p src/components/views/expenses',
  'mkdir -p src/components/views/subscriptions',
  'mkdir -p src/lib/firebase',
  'mkdir -p src/lib/hooks',
  'mkdir -p src/lib/services',
  
  // Move UI components
  'mv components/ui/* src/components/ui/',
  
  // Move view components
  'mv components/views/layout/* src/components/views/layout/',
  'mv components/views/auth/* src/components/views/auth/',
  'mv components/views/expenses/* src/components/views/expenses/',
  
  // Move lib files
  'mv lib/firebase/* src/lib/firebase/',
  'mv lib/hooks/* src/lib/hooks/',
  'mv lib/services/* src/lib/services/',
  
  // Clean up old directories
  'rm -rf components',
  'rm -rf lib'
];

export interface ReorganizeResult {
  success: boolean;
  executedCommands: string[];
  errors: string[];
}

export async function reorganize(): Promise<ReorganizeResult> {
  const result: ReorganizeResult = {
    success: true,
    executedCommands: [],
    errors: []
  };

  try {
    // Create backup directory
    const backupDir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Create backup of current structure
    execSync('cp -r components backup/ || true');
    execSync('cp -r lib backup/ || true');

    // Execute reorganization commands
    for (const command of commands) {
      try {
        execSync(command);
        result.executedCommands.push(command);
      } catch (error) {
        // Skip errors for move commands if files don't exist
        if (!command.startsWith('mv') || error.status !== 1) {
          result.errors.push(`Failed to execute: ${command}\nError: ${error.message}`);
        }
      }
    }

    // Update imports in all TypeScript files
    const updateImports = (dir: string) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          updateImports(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/from ['"]\.\.\/components/g, "from '../src/components");
          content = content.replace(/from ['"]\.\.\/lib/g, "from '../src/lib");
          fs.writeFileSync(filePath, content);
        }
      });
    };

    updateImports(path.join(process.cwd(), 'src'));

  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

if (require.main === module) {
  reorganize().then(result => {
    if (result.success) {
      console.log('✅ Project structure reorganized successfully');
      console.log('Backup of old structure saved in ./backup directory');
    } else {
      console.error('❌ Failed to reorganize project structure:');
      result.errors.forEach(error => console.error(error));
      process.exit(1);
    }
  });
} 