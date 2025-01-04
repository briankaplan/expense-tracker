import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface FixResult {
  success: boolean;
  message: string;
  details?: any;
}

interface CodeVerificationResult {
  type: 'structure' | 'imports' | 'typescript' | 'lint' | 'dependencies';
  status: 'success' | 'warning' | 'error';
  issues: string[];
  fixes?: string[];
}

export class NexusAutoFix extends EventEmitter {
  private supabase: SupabaseClient;
  private readonly projectRoot: string;

  constructor() {
    super();
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.projectRoot = process.cwd();
  }

  public async fixAll(): Promise<FixResult[]> {
    const results: FixResult[] = [];

    try {
      // Run all fixes in parallel
      const [
        databaseFixes,
        receiptFixes,
        emailFixes,
        backupFixes,
        orphanedFixes,
        structureFixes,
        importFixes,
        typescriptFixes,
        dependencyFixes
      ] = await Promise.all([
        this.fixDatabaseSync(),
        this.fixReceiptMatching(),
        this.fixEmailIntegration(),
        this.fixBackupSystem(),
        this.fixOrphanedRecords(),
        this.fixProjectStructure(),
        this.fixImports(),
        this.fixTypeScriptIssues(),
        this.fixDependencies()
      ]);

      results.push(
        databaseFixes,
        receiptFixes,
        emailFixes,
        backupFixes,
        orphanedFixes,
        structureFixes,
        importFixes,
        typescriptFixes,
        dependencyFixes
      );

      // Emit results for each fix
      results.forEach(result => {
        this.emit('fix-applied', result);
      });

      return results;
    } catch (error) {
      console.error('Error in fixAll:', error);
      const errorResult: FixResult = {
        success: false,
        message: 'Failed to complete all fixes',
        details: error
      };
      this.emit('fix-applied', errorResult);
      return [errorResult];
    }
  }

  private async fixDatabaseSync(): Promise<FixResult> {
    try {
      // Check for inconsistent transactions
      const { data: inconsistentTxns } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('status', 'syncing')
        .lt('updated_at', new Date(Date.now() - 30 * 60000).toISOString()); // Stuck for 30+ minutes

      if (inconsistentTxns && inconsistentTxns.length > 0) {
        // Reset stuck transactions
        await this.supabase
          .from('transactions')
          .update({ status: 'pending' })
          .in('id', inconsistentTxns.map(t => t.id));

        return {
          success: true,
          message: `Reset ${inconsistentTxns.length} stuck transactions`,
          details: { fixed: inconsistentTxns.length }
        };
      }

      return {
        success: true,
        message: 'No database sync issues found'
      };
    } catch (error) {
      console.error('Error fixing database sync:', error);
      return {
        success: false,
        message: 'Failed to fix database sync issues',
        details: error
      };
    }
  }

  private async fixReceiptMatching(): Promise<FixResult> {
    try {
      // Find unmatched receipts with potential matches
      const { data: unmatchedReceipts } = await this.supabase
        .from('receipts')
        .select(`
          *,
          transactions(
            amount,
            date,
            merchant
          )
        `)
        .eq('status', 'unmatched');

      if (unmatchedReceipts && unmatchedReceipts.length > 0) {
        let matchCount = 0;

        for (const receipt of unmatchedReceipts) {
          // Look for matching transaction
          const potentialMatch = receipt.transactions.find((t: any) =>
            Math.abs(t.amount - receipt.amount) < 0.01 && // Amount matches
            Math.abs(new Date(t.date).getTime() - new Date(receipt.date).getTime()) < 86400000 && // Within 24 hours
            t.merchant.toLowerCase().includes(receipt.merchant.toLowerCase()) // Merchant matches
          );

          if (potentialMatch) {
            await this.supabase
              .from('receipts')
              .update({
                status: 'matched',
                transaction_id: potentialMatch.id
              })
              .eq('id', receipt.id);

            matchCount++;
          }
        }

        return {
          success: true,
          message: `Matched ${matchCount} receipts with transactions`,
          details: { matched: matchCount }
        };
      }

      return {
        success: true,
        message: 'No unmatched receipts found'
      };
    } catch (error) {
      console.error('Error fixing receipt matching:', error);
      return {
        success: false,
        message: 'Failed to fix receipt matching',
        details: error
      };
    }
  }

  private async fixEmailIntegration(): Promise<FixResult> {
    try {
      // Check for stuck email processing
      const { data: stuckEmails } = await this.supabase
        .from('emails')
        .select('*')
        .eq('status', 'processing')
        .lt('updated_at', new Date(Date.now() - 15 * 60000).toISOString()); // Stuck for 15+ minutes

      if (stuckEmails && stuckEmails.length > 0) {
        // Reset stuck emails
        await this.supabase
          .from('emails')
          .update({ status: 'pending' })
          .in('id', stuckEmails.map(e => e.id));

        return {
          success: true,
          message: `Reset ${stuckEmails.length} stuck emails`,
          details: { fixed: stuckEmails.length }
        };
      }

      return {
        success: true,
        message: 'No email integration issues found'
      };
    } catch (error) {
      console.error('Error fixing email integration:', error);
      return {
        success: false,
        message: 'Failed to fix email integration',
        details: error
      };
    }
  }

  private async fixBackupSystem(): Promise<FixResult> {
    try {
      // Check for failed backups
      const { data: failedBackups } = await this.supabase
        .from('backups')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (failedBackups && failedBackups.length > 0) {
        // Queue failed backups for retry
        await this.supabase
          .from('backups')
          .update({ status: 'pending', retry_count: 0 })
          .in('id', failedBackups.map(b => b.id));

        return {
          success: true,
          message: `Requeued ${failedBackups.length} failed backups`,
          details: { requeued: failedBackups.length }
        };
      }

      return {
        success: true,
        message: 'No backup system issues found'
      };
    } catch (error) {
      console.error('Error fixing backup system:', error);
      return {
        success: false,
        message: 'Failed to fix backup system',
        details: error
      };
    }
  }

  private async fixOrphanedRecords(): Promise<FixResult> {
    try {
      // Find and clean up orphaned records
      const fixes: { table: string; count: number }[] = [];

      // Check for orphaned transactions
      const { data: orphanedTxns } = await this.supabase
        .from('transactions')
        .select('*')
        .is('user_id', null);

      if (orphanedTxns && orphanedTxns.length > 0) {
        await this.supabase
          .from('transactions')
          .delete()
          .in('id', orphanedTxns.map(t => t.id));

        fixes.push({ table: 'transactions', count: orphanedTxns.length });
      }

      // Check for orphaned receipts
      const { data: orphanedReceipts } = await this.supabase
        .from('receipts')
        .select('*')
        .is('transaction_id', null)
        .eq('status', 'matched');

      if (orphanedReceipts && orphanedReceipts.length > 0) {
        await this.supabase
          .from('receipts')
          .update({ status: 'unmatched' })
          .in('id', orphanedReceipts.map(r => r.id));

        fixes.push({ table: 'receipts', count: orphanedReceipts.length });
      }

      if (fixes.length > 0) {
        return {
          success: true,
          message: 'Fixed orphaned records',
          details: { fixes }
        };
      }

      return {
        success: true,
        message: 'No orphaned records found'
      };
    } catch (error) {
      console.error('Error fixing orphaned records:', error);
      return {
        success: false,
        message: 'Failed to fix orphaned records',
        details: error
      };
    }
  }

  private async fixProjectStructure(): Promise<FixResult> {
    try {
      const issues: string[] = [];
      const fixes: string[] = [];

      // Check and create essential directories
      const essentialDirs = [
        'src/components',
        'src/lib',
        'src/hooks',
        'src/types',
        'src/utils',
        'src/nexus/core',
        'src/nexus/services',
        'src/nexus/monitors',
        'src/nexus/types',
        'src/nexus/utils'
      ];

      for (const dir of essentialDirs) {
        const dirPath = path.join(this.projectRoot, dir);
        try {
          await fs.access(dirPath);
        } catch {
          issues.push(`Missing directory: ${dir}`);
          await fs.mkdir(dirPath, { recursive: true });
          fixes.push(`Created directory: ${dir}`);
        }
      }

      // Check for essential files
      const essentialFiles = [
        { path: 'tsconfig.json', template: 'tsconfig.template.json' },
        { path: '.env.example', template: 'env.template' },
        { path: '.gitignore', template: 'gitignore.template' },
        { path: 'package.json', template: 'package.template.json' }
      ];

      for (const file of essentialFiles) {
        const filePath = path.join(this.projectRoot, file.path);
        try {
          await fs.access(filePath);
        } catch {
          issues.push(`Missing file: ${file.path}`);
          // Create from template if available
          try {
            const templatePath = path.join(this.projectRoot, 'templates', file.template);
            await fs.copyFile(templatePath, filePath);
            fixes.push(`Created file: ${file.path} from template`);
          } catch {
            // Create empty file if template not available
            await fs.writeFile(filePath, '');
            fixes.push(`Created empty file: ${file.path}`);
          }
        }
      }

      return {
        success: issues.length === 0 || fixes.length > 0,
        message: issues.length === 0 ? 'Project structure is valid' : 'Fixed project structure issues',
        details: { issues, fixes }
      };
    } catch (error) {
      console.error('Error fixing project structure:', error);
      return {
        success: false,
        message: 'Failed to fix project structure',
        details: error
      };
    }
  }

  private async fixImports(): Promise<FixResult> {
    try {
      const issues: string[] = [];
      const fixes: string[] = [];

      // Get all TypeScript files
      const tsFiles = await this.findTypeScriptFiles();

      for (const file of tsFiles) {
        const content = await fs.readFile(file, 'utf-8');
        let updatedContent = content;

        // Fix relative imports to absolute imports
        updatedContent = this.fixRelativeImports(updatedContent, file);

        // Fix missing imports
        updatedContent = await this.fixMissingImports(updatedContent);

        // Fix unused imports
        updatedContent = this.removeUnusedImports(updatedContent);

        if (content !== updatedContent) {
          await fs.writeFile(file, updatedContent);
          fixes.push(`Fixed imports in: ${path.relative(this.projectRoot, file)}`);
        }
      }

      return {
        success: true,
        message: fixes.length > 0 ? 'Fixed import issues' : 'No import issues found',
        details: { fixes }
      };
    } catch (error) {
      console.error('Error fixing imports:', error);
      return {
        success: false,
        message: 'Failed to fix imports',
        details: error
      };
    }
  }

  private async fixTypeScriptIssues(): Promise<FixResult> {
    try {
      // Run TypeScript compiler check
      const { stdout, stderr } = await execAsync('npx tsc --noEmit');

      if (stderr) {
        const issues = stderr.split('\n').filter(line => line.includes('error TS'));
        const fixes: string[] = [];

        // Apply automatic fixes where possible
        for (const issue of issues) {
          const fix = await this.applyTypeScriptFix(issue);
          if (fix) {
            fixes.push(fix);
          }
        }

        return {
          success: fixes.length > 0,
          message: `Fixed ${fixes.length} TypeScript issues`,
          details: { issues, fixes }
        };
      }

      return {
        success: true,
        message: 'No TypeScript issues found'
      };
    } catch (error) {
      console.error('Error fixing TypeScript issues:', error);
      return {
        success: false,
        message: 'Failed to fix TypeScript issues',
        details: error
      };
    }
  }

  private async fixDependencies(): Promise<FixResult> {
    try {
      const issues: string[] = [];
      const fixes: string[] = [];

      // Read package.json
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      // Check for missing dependencies
      const requiredDeps = {
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          '@supabase/supabase-js': '^2.39.0',
          'openai': '^4.0.0'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          '@types/node': '^20.0.0',
          '@types/react': '^18.2.0',
          'eslint': '^8.0.0',
          'prettier': '^3.0.0'
        }
      };

      // Check and fix dependencies
      for (const [depType, deps] of Object.entries(requiredDeps)) {
        for (const [pkg, version] of Object.entries(deps)) {
          if (!packageJson[depType]?.[pkg]) {
            issues.push(`Missing ${depType}: ${pkg}`);
            packageJson[depType] = packageJson[depType] || {};
            packageJson[depType][pkg] = version;
            fixes.push(`Added ${pkg}@${version} to ${depType}`);
          }
        }
      }

      if (fixes.length > 0) {
        // Write updated package.json
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        // Run npm install
        await execAsync('npm install');
      }

      return {
        success: true,
        message: fixes.length > 0 ? 'Fixed dependency issues' : 'No dependency issues found',
        details: { issues, fixes }
      };
    } catch (error) {
      console.error('Error fixing dependencies:', error);
      return {
        success: false,
        message: 'Failed to fix dependencies',
        details: error
      };
    }
  }

  // Helper methods
  private async findTypeScriptFiles(): Promise<string[]> {
    const files: string[] = [];
    
    async function walk(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    await walk(this.projectRoot);
    return files;
  }

  private fixRelativeImports(content: string, filePath: string): string {
    const importRegex = /^import\s+(?:{\s*[\w\s,]+\s*}|\*\s+as\s+\w+|\w+)\s+from\s+['"](\.[^'"]+)['"];?$/gm;
    
    return content.replace(importRegex, (match, importPath) => {
      const absolutePath = path.resolve(path.dirname(filePath), importPath);
      const relativePath = path.relative(this.projectRoot, absolutePath);
      const aliasPath = relativePath.startsWith('src/') ? `@/${relativePath.slice(4)}` : relativePath;
      
      return match.replace(importPath, aliasPath);
    });
  }

  private async fixMissingImports(content: string): Promise<string> {
    // This is a simplified version. A real implementation would need to:
    // 1. Parse the TypeScript AST
    // 2. Find undefined identifiers
    // 3. Look up possible imports for those identifiers
    // 4. Add the imports
    return content;
  }

  private removeUnusedImports(content: string): string {
    // This is a simplified version. A real implementation would need to:
    // 1. Parse the TypeScript AST
    // 2. Track usage of imported identifiers
    // 3. Remove unused imports
    return content;
  }

  private async applyTypeScriptFix(issue: string): Promise<string | null> {
    // This is a simplified version. A real implementation would need to:
    // 1. Parse the TypeScript error
    // 2. Determine the appropriate fix
    // 3. Apply the fix to the file
    // 4. Return a description of the fix
    return null;
  }
} 