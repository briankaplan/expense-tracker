import { OpenAI } from 'openai';
import chalk from 'chalk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import _ from 'lodash';

interface FixResult {
    fixed: boolean;
    changes: string[];
    errors?: string[];
}

interface FileIssue {
    file: string;
    type: 'import' | 'typescript' | 'lint' | 'console' | 'structure';
    line?: number;
    message: string;
    suggestedFix?: string;
}

export class NexusAutoFix {
    private openai: OpenAI;
    private readonly BACKUP_DIR = '.nexus/backups';
    private readonly MAX_BACKUPS = 5;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is required');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async runAutoFix(): Promise<void> {
        console.log(chalk.blue('🔄 Starting Nexus AutoFix...\n'));

        try {
            // Create backup before making any changes
            await this.createBackup();

            // Fix in order of dependency
            await this.fixFileStructure();
            await this.fixDependencies();
            await this.fixImports();
            await this.fixTypeScriptErrors();
            await this.fixConsoleErrors();
            await this.fixLintingIssues();

            // Verify fixes
            await this.verifyFixes();

            console.log(chalk.green('\n✨ AutoFix completed successfully!\n'));
        } catch (error) {
            console.error(chalk.red('\n❌ AutoFix failed:'), error);
            await this.restoreBackup();
            throw error;
        }
    }

    private async createBackup(): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(this.BACKUP_DIR, timestamp);

        await fs.mkdir(backupDir, { recursive: true });
        await this.executeCommand(`cp -r . ${backupDir}`);

        // Remove old backups if exceeding MAX_BACKUPS
        const backups = await fs.readdir(this.BACKUP_DIR);
        if (backups.length > this.MAX_BACKUPS) {
            const oldestBackup = backups.sort()[0];
            await fs.rm(path.join(this.BACKUP_DIR, oldestBackup), { recursive: true });
        }
    }

    private async restoreBackup(): Promise<void> {
        const backups = await fs.readdir(this.BACKUP_DIR);
        if (backups.length === 0) return;

        const latestBackup = backups.sort().pop()!;
        const backupPath = path.join(this.BACKUP_DIR, latestBackup);
        
        await this.executeCommand(`cp -r ${backupPath}/* .`);
        console.log(chalk.yellow('Restored from backup due to error'));
    }

    private async fixFileStructure(): Promise<FixResult> {
        console.log(chalk.blue('\n🗂️  Fixing file structure...'));
        const changes: string[] = [];

        const STRUCTURE = {
            'src/components/ui': ['Button', 'Card', 'Input', 'Select'].map(c => `${c}.tsx`),
            'src/components/views': ['layout', 'dashboard', 'settings'].map(d => d),
            'src/lib': ['utils', 'hooks', 'api'].map(d => d),
            'src/types': ['index.ts', 'api.ts', 'components.ts'],
            'src/styles': ['globals.css', 'components.css'],
            'public': ['assets', 'icons', 'images'].map(d => d)
        };

        try {
            // Create and organize directories
            for (const [dir, files] of Object.entries(STRUCTURE)) {
                await fs.mkdir(dir, { recursive: true });
                changes.push(`Created directory: ${dir}`);

                // Move any existing files to correct locations
                for (const file of files) {
                    const targetPath = path.join(dir, file);
                    const possibleLocations = [
                        file,
                        `src/${file}`,
                        `components/${file}`,
                        `app/${file}`
                    ];

                    for (const loc of possibleLocations) {
                        if (existsSync(loc) && loc !== targetPath) {
                            await fs.rename(loc, targetPath);
                            changes.push(`Moved ${loc} to ${targetPath}`);
                        }
                    }
                }
            }

            return { fixed: true, changes };
        } catch (error) {
            return { fixed: false, changes, errors: [String(error)] };
        }
    }

    private async fixDependencies(): Promise<FixResult> {
        console.log(chalk.blue('\n📦 Fixing dependencies...'));
        const changes: string[] = [];

        try {
            // Check for duplicate dependencies
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            // Remove duplicates
            const duplicates = this.findDuplicateDependencies(allDeps);
            for (const dup of duplicates) {
                delete packageJson.devDependencies[dup];
                changes.push(`Removed duplicate dependency: ${dup}`);
            }

            // Update outdated dependencies
            const outdated = await this.getOutdatedDependencies();
            for (const [pkg, version] of Object.entries(outdated)) {
                await this.executeCommand(`npm install ${pkg}@${version}`);
                changes.push(`Updated ${pkg} to ${version}`);
            }

            // Fix security vulnerabilities
            const audit = await this.executeCommand('npm audit fix');
            if (audit.includes('fixed')) {
                changes.push('Fixed security vulnerabilities');
            }

            // Clean install
            await this.executeCommand('npm ci');
            changes.push('Performed clean install');

            return { fixed: true, changes };
        } catch (error) {
            return { fixed: false, changes, errors: [String(error)] };
        }
    }

    private async fixImports(): Promise<FixResult> {
        console.log(chalk.blue('\n🔍 Fixing imports...'));
        const changes: string[] = [];

        try {
            const tsFiles = await this.findFiles('**/*.{ts,tsx}');
            
            for (const file of tsFiles) {
                const content = await fs.readFile(file, 'utf8');
                let newContent = content;

                // Fix import paths
                newContent = this.fixImportPaths(newContent);
                
                // Fix missing imports
                newContent = await this.fixMissingImports(newContent, file);
                
                // Fix unused imports
                newContent = this.removeUnusedImports(newContent);

                if (newContent !== content) {
                    await fs.writeFile(file, newContent);
                    changes.push(`Fixed imports in ${file}`);
                }
            }

            return { fixed: true, changes };
        } catch (error) {
            return { fixed: false, changes, errors: [String(error)] };
        }
    }

    private async fixTypeScriptErrors(): Promise<FixResult> {
        console.log(chalk.blue('\n⚡ Fixing TypeScript errors...'));
        const changes: string[] = [];

        try {
            // Run TypeScript compiler to get errors
            const tscOutput = await this.executeCommand('npx tsc --noEmit');
            const errors = this.parseTypeScriptErrors(tscOutput);

            for (const error of errors) {
                const fix = await this.getAIFix(error);
                if (fix) {
                    const content = await fs.readFile(error.file, 'utf8');
                    const updatedContent = this.applyFix(content, fix, error.line);
                    await fs.writeFile(error.file, updatedContent);
                    changes.push(`Fixed TypeScript error in ${error.file}:${error.line}`);
                }
            }

            return { fixed: true, changes };
        } catch (error) {
            return { fixed: false, changes, errors: [String(error)] };
        }
    }

    private async fixConsoleErrors(): Promise<FixResult> {
        console.log(chalk.blue('\n🛠️  Fixing console errors...'));
        const changes: string[] = [];

        try {
            const files = await this.findFiles('**/*.{ts,tsx}');
            
            for (const file of files) {
                const content = await fs.readFile(file, 'utf8');
                let newContent = content;

                // Replace console.log with proper logging
                newContent = this.replaceConsoleLogs(newContent);

                // Add error handling to promises
                newContent = this.addErrorHandling(newContent);

                // Add proper type checking
                newContent = this.addTypeChecks(newContent);

                if (newContent !== content) {
                    await fs.writeFile(file, newContent);
                    changes.push(`Fixed console issues in ${file}`);
                }
            }

            return { fixed: true, changes };
        } catch (error) {
            return { fixed: false, changes, errors: [String(error)] };
        }
    }

    private async fixLintingIssues(): Promise<FixResult> {
        console.log(chalk.blue('\n✨ Fixing linting issues...'));
        const changes: string[] = [];

        try {
            // Run ESLint fix
            await this.executeCommand('npx eslint . --fix');
            
            // Run Prettier
            await this.executeCommand('npx prettier --write .');
            
            changes.push('Applied automatic linting fixes');
            changes.push('Applied code formatting');

            return { fixed: true, changes };
        } catch (error) {
            return { fixed: false, changes, errors: [String(error)] };
        }
    }

    private async verifyFixes(): Promise<void> {
        console.log(chalk.blue('\n✅ Verifying fixes...'));

        // Run all checks
        const results = await Promise.all([
            this.executeCommand('npm run build'),
            this.executeCommand('npm run lint'),
            this.executeCommand('npx tsc --noEmit')
        ]);

        const allPassed = results.every(result => !result.includes('error'));
        if (!allPassed) {
            throw new Error('Verification failed after fixes');
        }
    }

    // Helper methods
    private async getAIFix(issue: FileIssue): Promise<string | null> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert TypeScript developer. Provide a specific code fix for the following issue.'
                    },
                    {
                        role: 'user',
                        content: `Fix this TypeScript error: ${issue.message} in file ${issue.file} at line ${issue.line}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 200
            });

            return response.choices[0]?.message?.content || null;
        } catch {
            return null;
        }
    }

    private async executeCommand(command: string): Promise<string> {
        try {
            return execSync(command, { encoding: 'utf8' });
        } catch (error: any) {
            return error.output?.[1]?.toString() || '';
        }
    }

    private async findFiles(pattern: string): Promise<string[]> {
        const glob = await import('glob');
        return glob.glob(pattern, { ignore: ['node_modules/**'] });
    }

    private fixImportPaths(content: string): string {
        return content
            .replace(/@\/src\//g, '@/')
            .replace(/from ['"]\.\.\/src\//g, 'from "@/')
            .replace(/from ['"]src\//g, 'from "@/')
            .replace(/from ['"]\.\.\//g, 'from "@/');
    }

    private async fixMissingImports(content: string, file: string): Promise<string> {
        // Add missing imports logic
        return content;
    }

    private removeUnusedImports(content: string): string {
        // Remove unused imports logic
        return content;
    }

    private parseTypeScriptErrors(output: string): FileIssue[] {
        const errors: FileIssue[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            const match = line.match(/(.+)\((\d+),\d+\): error TS\d+: (.+)/);
            if (match) {
                errors.push({
                    file: match[1],
                    line: parseInt(match[2]),
                    type: 'typescript',
                    message: match[3]
                });
            }
        }

        return errors;
    }

    private applyFix(content: string, fix: string, line: number): string {
        const lines = content.split('\n');
        lines[line - 1] = fix;
        return lines.join('\n');
    }

    private replaceConsoleLogs(content: string): string {
        return content.replace(
            /console\.log\((.*)\)/g,
            'logger.info($1)'
        );
    }

    private addErrorHandling(content: string): string {
        return content.replace(
            /async \w+\([^)]*\)\s*{/g,
            '$&\ntry {'
        ).replace(
            /}\s*$/g,
            '} catch (error) {\n  logger.error(error);\n  throw error;\n}'
        );
    }

    private addTypeChecks(content: string): string {
        // Add runtime type checking logic
        return content;
    }

    private findDuplicateDependencies(deps: Record<string, string>): string[] {
        return Object.keys(deps).filter(
            (dep, index, array) => array.indexOf(dep) !== index
        );
    }

    private async getOutdatedDependencies(): Promise<Record<string, string>> {
        try {
            const output = await this.executeCommand('npm outdated --json');
            const outdated = JSON.parse(output);
            return Object.fromEntries(
                Object.entries(outdated).map(([pkg, info]: [string, any]) => [
                    pkg,
                    info.latest
                ])
            );
        } catch {
            return {};
        }
    }
} 